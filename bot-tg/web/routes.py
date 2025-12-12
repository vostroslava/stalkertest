from fastapi import FastAPI, APIRouter, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from core.texts import TYPES_DATA, get_types_for_api
from core.config import settings
from core.telegram_checks import is_subscribed_to_required_channel
from core.logic import calculate_result, DIAGNOSTIC_QUESTIONS
import os
import logging
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from core.limiter import limiter
from infrastructure.db import db

# Services
from repositories.user_repository import UserRepository
from repositories.test_repository import TestRepository
from services.user_service import UserService
from services.test_service import TestService
from models.user import UserContact
from core.dependencies import user_service, test_service, user_repo, test_repo, notification_service


logger = logging.getLogger(__name__)

# Service Instantiation
# user_repo = UserRepository()
# test_repo = TestRepository()
# user_service = UserService(user_repo)
# test_service = TestService(test_repo)


app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

@app.on_event("startup")
async def startup():
    await db.connect()
    try:
        await user_repo.ensure_schema()
        logger.info("User schema updated")
    except Exception as e:
        logger.error(f"User schema update failed: {e}")
    try:
        await test_repo.ensure_schema()
        logger.info("Test schema updated")
    except Exception as e:
        logger.error(f"Test schema update failed: {e}")

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

# ==== NEW: Unified Lead Registration Endpoint ====
@router.post("/api/lead/register")
@limiter.limit("10/minute")
async def register_lead(request: Request):
    """
    Unified endpoint for lead registration from all frontends (Teremok, Formula, Bot Web).
    Expected JSON:
    {
        "name": str, "role": str, "phone_or_messenger": str, "consent": bool,
        "email": str (opt), "company": str (opt), "team_size": str (opt),
        "comment": str (opt), "preferred_channel": str (opt),
        "product": str, "source": str, "session_id": str (opt),
        "utm_source": str (opt), ...
    }
    """
    try:
        data = await request.json()
        
        # Validation
        if not data.get('consent'):
             return JSONResponse({"status": "error", "message": "Consent required"}, status_code=400)
        
        # Normalization (Fallback for legacy fields)
        phone_or_messenger = data.get('phone_or_messenger') or data.get('phone') or ''
        preferred_channel = data.get('preferred_channel') or data.get('messenger') or None
        comment = data.get('comment') or data.get('request') or None
        
        product = data.get('product', 'unknown')
        source = data.get('source', 'unknown')

        # === DEDUPLICATION ===
        deduped = False
        user_id = data.get('user_id')
        
        if not user_id and phone_or_messenger:
            # Check for existing lead in last 30 days
            duplicate = await user_repo.find_duplicate_contact(product, phone_or_messenger, days=30)
            if duplicate:
                user_id = duplicate.user_id
                deduped = True
                logger.info(f"Lead deduplicated: found existing {user_id} for {product}/{phone_or_messenger}")
                
                # Update existing fields if new ones provided (Merge logic)
                # We use the new data if truthy, else keep old?
                # Actually UserContact logic below overwrites. 
                # To support "update only if nonempty", we strictly pick nonempty from data,
                # otherwise fallback to duplicate's data for core fields.
                # However, the constructor below takes arguments. We can just fill them smartly.
                
                # Pre-fill with duplicate data defaults
                # But wait, we want to construct UserContact with merged data.
                
                # Let's map normalized "data" to new_vals
                new_name = data.get('name')
                new_role = data.get('role')
                new_email = data.get('email')
                new_company = data.get('company')
                new_team = data.get('team_size')
                new_comment = comment
                new_channel = preferred_channel
                new_source = source # Source usually updates to last touch
                
                # If new is provided, use it. Else use duplicate's if available?
                # Requirement: "a) НЕ создавать новую запись b) обновить существующую запись полями, если в новом запросе они непустые"
                # This implies: If request has name="New", update it. If request has name="", KEEP OLD?
                # Yes.
                
                data['name'] = new_name or duplicate.name
                data['role'] = new_role or duplicate.role
                data['email'] = new_email or duplicate.email
                data['company'] = new_company or duplicate.company
                data['team_size'] = new_team or duplicate.team_size
                comment = new_comment or duplicate.comment # Merge comment? Or overwrite? "Update if nonempty" implies overwrite.
                preferred_channel = new_channel or duplicate.preferred_channel
                
                # utms usually overwrite on new touch
                
        # =====================

        # User ID Logic: If still None, generate
        if not user_id:
             import random
             user_id = random.randint(100000000, 999999999)

        contact = UserContact(
            user_id=user_id,
            name=data.get('name', 'Unknown'),
            role=data.get('role', 'other'),
            phone=phone_or_messenger,
            consent=data.get('consent', False),
            email=data.get('email'),
            company=data.get('company'),
            team_size=data.get('team_size'),
            comment=comment,
            preferred_channel=preferred_channel,
            product=product,
            source=source,
            session_id=data.get('session_id'),
            utm_source=data.get('utm_source'),
            utm_medium=data.get('utm_medium'),
            utm_campaign=data.get('utm_campaign'),
            utm_content=data.get('utm_content'),
            utm_term=data.get('utm_term')
        )
        
        await user_service.register_contact(contact)
        
        # Notify (skip if deduped? Or notify "Lead Returned"?)
        # Requirement says nothing about skipping notify. But usually we want to know.
        # "если у вас есть таблица/лог событий — добавь событие ... если нет — просто добавь короткий лог"
        if deduped:
            logger.info(f"Lead updated (deduped): {user_id}")
        
        if settings.SEND_NOTIFICATIONS:
             prefix = "♻️ Lead Updated" if deduped else "Unified Lead"
             msg = f"{prefix} ({contact.product})\nRole: {contact.role}\nSource: {contact.source}"
             if contact.comment:
                 msg += f"\nComment: {contact.comment}"
             
             await notification_service.notify_new_lead(
                 name=contact.name,
                 contact=contact.phone,
                 message=msg,
                 source=f"Unified API ({contact.product})",
                 username=None,
                 user_id=user_id
             )

        # Export (Try/Catch)
        try:
            from core.google_sheets import export_lead_to_sheets
            await export_lead_to_sheets(contact.__dict__)
        except Exception as e:
            logger.error(f"Sheets export error: {e}")

        return JSONResponse({
            "status": "success", 
            "lead_id": user_id,
            "deduped": deduped,
            "session_id": contact.session_id or str(user_id)
        })
    except Exception as e:
         logger.error(f"Register Lead Error: {e}")
         return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


# Jinja2 templates for new app pages
templates_path = os.path.join(os.path.dirname(__file__), "templates")
templates = Jinja2Templates(directory=templates_path)

# Bot instance for notifications
def set_bot(bot):
    notification_service.set_bot(bot)

# API Endpoint to get types (legacy, for compatibility)
@router.get("/api/types")
async def get_types():
    # Convert dataclasses to dicts
    return {k: v.__dict__ for k, v in TYPES_DATA.items()}

# API Endpoint to get Teremok types with full info
@router.get("/api/teremok/types")
async def get_teremok_types():
    """Return all Teremok types with full descriptions for UI"""
    from core.texts import get_types_for_api
    return {"types": get_types_for_api()}

# API Endpoint to get Teremok test questions
@router.get("/api/teremok/questions")
async def get_teremok_questions():
    """Return all diagnostic questions for Teremok test"""
    questions = []
    for q in DIAGNOSTIC_QUESTIONS:
        questions.append({
            "id": q.id,
            "text": q.text,
            "options": [{"text": opt["text"], "index": i} for i, opt in enumerate(q.options)]
        })
    return {"questions": questions, "total": len(questions)}

# ==== NEW: Check subscription endpoint ====
@router.get("/api/check-subscription")
async def check_subscription(user_id: int):
    """
    Проверяет подписку пользователя на обязательный канал и наличие контактов
    
    Query params:
        user_id: Telegram user_id
    
    Returns:
        subscribed: bool - подписан ли на канал
        has_contact: bool - оставлены ли контакты ранее
        channel_username: str - username канала
    """
    # Use notification_service's bot_instance for subscription check
    bot_instance = notification_service.get_bot_instance()
    if not bot_instance:
        return JSONResponse({"subscribed": False, "has_contact": False, "error": "Bot not initialized"})
    
    # Проверяем подписку на канал
    is_subscribed = await is_subscribed_to_required_channel(bot_instance, user_id)
    
    # Проверяем наличие контактов в БД
    user_has_contact = await user_service.has_contact(user_id)
    
    return JSONResponse({
        "subscribed": is_subscribed,
        "has_contact": user_has_contact,
        "channel_username": settings.REQUIRED_CHANNEL_USERNAME
    })

# ==== NEW: Save contacts endpoint ====
@router.post("/api/contacts")
@limiter.limit("5/minute")
async def save_user_contacts(request: Request):
    """
    Сохранение контактных данных пользователя и отправка уведомления менеджеру
    
    Expected JSON:
        {
            "user_id": int,
            "name": str,
            "role": str,
            "company": str,
            "team_size": str,
            "phone": str,
            "username": str (optional),
            "product": str (optional, default "teremok")
        }
    """
    try:
        data = await request.json()
        user_id = int(data['user_id'])
        product = data.get('product', 'teremok')
        
        # Create contact model
        contact = UserContact(
            user_id=user_id,
            name=data['name'],
            role=data['role'],
            company=data.get('company', ''),
            team_size=data['team_size'],
            phone=data['phone'],
            telegram_username=data.get('username'),
            product=product
        )
        
        # Save via service
        await user_service.register_contact(contact)
        logger.info(f"Contacts saved for user {user_id}")
        
        # Notification
        await notification_service.notify_new_lead(
            name=data['name'],
            contact=data['phone'],
            message=f"Role: {data['role']}, Company: {data['company']}",
            source="Web API",
            username=data.get('username'),
            user_id=data.get('user_id')
        )
        
        # Export to Google Sheets
        try:
            from core.google_sheets import export_lead_to_sheets
            await export_lead_to_sheets(contact.__dict__)
        except Exception as e:
            logger.error(f"Failed to export lead to sheets: {e}")
        
        return JSONResponse({
            "status": "success", 
            "message": "Контакты сохранены"
        })
        
    except Exception as e:
        logger.error(f"Failed to save contacts: {e}")
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


# ==== NEW: Submit test results endpoint ====
@router.post("/api/test/submit")
@limiter.limit("10/minute")
async def submit_test_results(request: Request):
    """
    Сохранение результатов теста и отправка уведомления менеджеру
    
    Expected JSON:
        {
            "user_id": int,
            "answers": dict  # Ответы на вопросы теста
        }
    """
    try:
        data = await request.json()
        user_id = data['user_id']
        answers = data['answers']
        
        # Process via service
        test_id = await test_service.process_teremok_test(user_id, answers)
        
        # Calculate result locally for response context
        result_calc = calculate_result(answers)
        result_type = result_calc['type']

        # === UNIFIED STORAGE ===
        try:
             # Try to get existing contact info to enrich source
             contact_info = await user_service.get_contact(user_id)
             src = contact_info.source if contact_info else 'unknown'
             chn = contact_info.preferred_channel if contact_info else 'unknown'
             
             await test_repo.save_test_session(
                 user_id=user_id,
                 product='teremok',
                 source=src,
                 channel=chn,
                 answers=answers,
                 result=result_calc,
                 meta={"type": result_type}
             )
        except Exception as e:
            logger.warning(f"Failed to save unified test session (Teremok): {e}")
        # =======================
        
        logger.info(f"Test result saved for user {user_id}: {result_type} (ID: {test_id})")
        
        # Получаем контакты (если есть)
        contact = await user_service.get_contact(user_id)
        
        # Отправляем уведомление менеджеру только если включено
        if settings.SEND_NOTIFICATIONS:
            await notification_service.notify_test_result(
                user_id=user_id,
                contact=contact,
                result_type=result_type,
                answers=answers,
                product="teremok",
                scores=result_calc.get('scores', {})
            )
        
        # Экспорт в Google Sheets
        try:
            # We add test_id just in case, though google sheets logic might not use it yet
            from core.google_sheets import export_test_to_sheets
            await export_test_to_sheets(
                test={"user_id": user_id, "result_type": result_type, "scores": result_calc.get('scores', {}), "product": "teremok", "test_id": test_id},
                lead=contact
            )
        except Exception as e:
            logger.error(f"Failed to export test to sheets: {e}")
        
        type_info = TYPES_DATA.get(result_type)
        
        if type_info and hasattr(type_info, 'name_ru'):
            # It's a TypeData object
            res_title = type_info.name_ru
            res_desc = type_info.short_desc
            res_full = ""
        elif isinstance(type_info, dict):
            # Fallback if it were a dict
            res_title = type_info.get("title", result_type)
            res_desc = type_info.get("description", "Результат сохранен")
            res_full = type_info.get("full_description", "")
        else:
            # Not found
            res_title = result_type
            res_desc = "Результат сохранен"
            res_full = ""

        return JSONResponse({
            "status": "success",
            "result_id": test_id,
            "result_type": result_type,
            "scores": result_calc.get('scores', {}),
            "result_info": {
                "title": res_title,
                "description": res_desc,
                "full_description": res_full
            }
        })
        
    except Exception as e:
        logger.error(f"Error in submit_test_results: {e}")
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )

@router.get("/app/teremok/result/{result_id}", response_class=HTMLResponse)
async def teremok_result_page(request: Request, result_id: int):
    """Страница результата теста"""
    try:
        # Fetch result from Service
        result_obj = await test_service.get_test_result_by_id(result_id)
        
        if not result_obj:
            return HTMLResponse("<h1>Результат не найден</h1>", status_code=404)
            
        # Convert to dict for template
        result = result_obj.__dict__
        
        # Get detailed type info
        type_info = TYPES_DATA.get(result.get('result_type'))
        if not type_info:
            # Fallback for unknown type
            type_info = TYPES_DATA.get("bird") 
            
        # Parse scores if stored as string (should be dict from pydantic, but double check)
        scores = result.get('scores', {})
        if isinstance(scores, str):
            try:
                import json
                scores = json.loads(scores)
            except:
                scores = {}
                
        # Get types data for the chart
        all_types = get_types_for_api()
        
        return templates.TemplateResponse("teremok/result.html", {
            "request": request,
            "result": result,
            "type_info": type_info,
            "scores": scores,
            "all_types": all_types
        })
    except Exception as e:
        logger.error(f"Error loading result page: {e}")
        return HTMLResponse(f"<h1>Ошибка загрузки результата</h1><p>{str(e)}</p>", status_code=500)
        


# Legacy endpoint (keep for backwards compatibility)
@router.post("/api/submit-lead")
async def submit_lead(request: Request):
    try:
        data = await request.json()
        name = data.get("name", "Не указано")
        contact_info_str = data.get("contact", "Не указано") # Renamed to avoid conflict with UserContact
        message = data.get("message", "")
        result_type = data.get("result_type", "")
        
        # Save to database via service
        await user_service.submit_lead(name, contact_info_str, f"Результат: {result_type}\n\n{message}" if result_type else message)
        
        # Send to manager if bot is available (legacy behavior)
        if settings.SEND_NOTIFICATIONS:
            await notification_service.notify_new_lead(
                name=name,
                contact=contact_info_str,
                message=message,
                source="Legacy Web API",
                username=None,
                user_id=0
            )
        
        if result_type:
            # Also notify about test result if provided
            await notification_service.notify_test_result(
                 result_type=result_type,
                 answers={}, # Not available in legacy lead
                 contact={"name": name, "phone": contact_info_str},
                 user_id=0, # Web user
                 product="teremok", # assumed
                 scores={} # Not available in legacy lead
            )
        
        return JSONResponse({"status": "success", "message": "Заявка отправлена!"})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

# ==== NEW: App Page Routes (Jinja2 templates) ====

# Hub
@app.get("/app/hub")
async def app_hub(request: Request):
    return templates.TemplateResponse("hub.html", {"request": request})

# Teremok section
@app.get("/app/teremok/overview")
async def teremok_overview(request: Request):
    return templates.TemplateResponse("teremok/overview.html", {"request": request})

@app.get("/app/teremok/self_test")
async def teremok_self_test(request: Request):
    return templates.TemplateResponse("teremok/self_test.html", {"request": request})

@app.get("/app/teremok/types_overview")
async def teremok_types_overview(request: Request):
    return templates.TemplateResponse("teremok/types_overview.html", {"request": request})

@app.get("/app/teremok/cases")
async def teremok_cases(request: Request):
    return templates.TemplateResponse("teremok/cases.html", {"request": request})

# ==== NEW: Formula Module Routes ====

# API: Get questions
@router.get("/api/formula/questions")
async def get_formula_questions():
    from core.formula_logic import FORMULA_QUESTIONS, FORMULA_OPTIONS
    questions = [
        {
            "id": q.id,
            "text": q.text,
            "options": FORMULA_OPTIONS
        }
        for q in FORMULA_QUESTIONS
    ]
    return {"questions": questions, "total": len(questions)}


# ===== FORMULA (RSP) MODULE =====

@app.get("/api/formula/rsp/questions")
async def get_formula_rsp_questions():
    """Get questions for Formula RSP test"""
    from core.formula_rsp_questions import FORMULA_RSP_QUESTIONS
    return JSONResponse({"questions": FORMULA_RSP_QUESTIONS})

@app.post("/api/formula/rsp/submit")
@limiter.limit("5/minute")
async def submit_formula_rsp_results(request: Request):
    try:
        data = await request.json()
        user_id = data.get('user_id')
        # employee_name/role might not be sent if we skipped form (subscribed user)
        # So we try to get them, but don't force save_contact if they are missing
        
        name = data.get('employee_name')
        role = data.get('employee_role')
        answers = data.get('answers') 
        
        if not user_id or not answers:
             # Random ID for guest flow if missing
             if not user_id: 
                 import random
                 user_id = random.randint(1000000, 9999999)
        
        if not user_id: 
                 import random
                 user_id = random.randint(1000000, 9999999)
        
        # Ensure contact exists (Guest or Subscribed)
        user_has_contact = await user_service.has_contact(user_id)
        
        # If we have explicit Name/Role in payload (from Form), update/save contact
        if name and role:
             contact = UserContact(
                user_id=user_id,
                name=name,
                role=role,
                company="", 
                team_size="",
                phone="",
                telegram_username=None,
                product="formula_rsp"
             )
             await user_service.register_contact(contact)
             
        elif not user_has_contact:
            # No contact and no payload -> Create guest
             contact = UserContact(
                user_id=user_id,
                name="Guest User",
                role="Guest",
                company="",
                team_size="",
                phone="",
                telegram_username=None,
                product="formula_rsp"
             )
             await user_service.register_contact(contact)

        # Calculate and Save Result via Service
        result_obj = await test_service.process_formula_rsp(user_id, answers)
        test_id = result_obj.id
        
        # === UNIFIED STORAGE ===
        try:
             # Try to get existing contact info to enrich source
             contact_info = await user_service.get_contact(user_id)
             src = contact_info.source if contact_info else 'unknown'
             chn = contact_info.preferred_channel if contact_info else 'unknown'
             
             await test_repo.save_test_session(
                 user_id=user_id,
                 product='formula',
                 source=src,
                 channel=chn,
                 answers=answers,
                 result=result_obj.scores, # Or full obj
                 meta={"type": result_obj.primary_name}
             )
        except Exception as e:
            logger.warning(f"Failed to save unified test session (Formula): {e}")
        # =======================

        logger.info(f"Formula RSP result saved for {user_id}: {result_obj.primary_code} (ID: {test_id})")
        
        # Export to Google Sheets
        contact = await user_service.get_contact(user_id)
        try:
            from core.google_sheets import export_test_to_sheets
            await export_test_to_sheets(
                test={
                    "user_id": user_id, 
                    "result_type": result_obj.primary_name,
                    "scores": result_obj.scores,
                    "product": "formula_rsp",
                    "test_id": test_id,
                    "name": name,
                    "role": role 
                },
                lead=contact.__dict__ if contact else None
            )
        except Exception as e:
            logger.error(f"Failed to export Formula RSP to sheets: {e}")

        # Send notification
        if settings.SEND_NOTIFICATIONS:
            await notification_service.notify_test_result(
                user_id=user_id,
                contact=contact,
                result_type=result_obj.primary_name,
                answers=answers,
                product="formula_rsp",
                scores=result_obj.scores
            )

        # Return result
        return JSONResponse({
            "status": "success",
            "result": {
                "id": test_id,
                "primary_code": result_obj.primary_code,
                "primary_name": result_obj.primary_name,
                "secondary_codes": result_obj.secondary_codes,
                "scores": result_obj.scores,
                "description": result_obj.description,
                "recommendations": result_obj.recommendations,
                "emoji": result_obj.emoji
            }
        })

    except Exception as e:
        logger.error(f"Error in submit_formula_rsp_results: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@app.get("/app/formula/self_test", response_class=HTMLResponse)
async def formula_self_test_page(request: Request):
    """Main page for Formula RSP test"""
    return templates.TemplateResponse("formula/rsp_test.html", {"request": request})

@app.get("/app/formula/info", response_class=HTMLResponse)
async def formula_info_page(request: Request):
    """Info page redirected to test or separate info"""
    # For now, let's keep it as separate info page or redirect to test?
    # User asked for /app/formula/info as optional, but let's make it render a simple info page 
    # OR reuse the one we had but adapted. 
    # Actually, let's redirect to rsp_test as the landing for now if simpler
    return templates.TemplateResponse("formula/rsp_test.html", {"request": request})




@app.get("/app/formula/overview", response_class=HTMLResponse)
async def formula_overview_page(request: Request):
    return templates.TemplateResponse("formula/overview.html", {"request": request})

@app.get("/app/formula")
async def formula_root_redirect(request: Request):
    return RedirectResponse(url="/app/formula/overview")



@app.get("/app/formula/types", response_class=HTMLResponse)
async def formula_types_page(request: Request):
    return templates.TemplateResponse("formula/types.html", {"request": request})

@app.get("/app/formula/situations", response_class=HTMLResponse)
async def formula_situations_page(request: Request):
    return templates.TemplateResponse("formula/situations.html", {"request": request})

@app.get("/app/formula/result/{test_id}")
async def formula_result_page(request: Request, test_id: int):
    try:
        result_obj = await test_service.get_formula_result_by_id(test_id)
        
        if not result_obj:
            return HTMLResponse("<h1>Результат не найден</h1>", status_code=404)
            
        row_dict = result_obj.__dict__
        
        # Get detailed type info from RSP types
        from core.formula_rsp_types import get_rsp_type, FORMULA_RSP_TYPES
        
        # primary_type_code field from DB
        type_code = row_dict['primary_type_code']
        type_info = get_rsp_type(type_code)
        
        if not type_info:
            # Fallback
            type_info = get_rsp_type("result")
             
        # Parse scores
        import json
        try:
             scores = json.loads(row_dict['scores']) if isinstance(row_dict['scores'], str) else row_dict['scores']
        except:
             scores = {}
             
        # All types for chart
        all_types = list(FORMULA_RSP_TYPES.values())
             
        return templates.TemplateResponse("formula/result.html", {
            "request": request,
            "type_info": type_info,
            "scores": scores,
            "all_types": all_types
        })
            
    except Exception as e:
        logger.error(f"Error loading Formula result page: {e}")
        return HTMLResponse(f"<h1>Ошибка загрузки</h1><p>{e}</p>", status_code=500)


# Formula section placeholders (kept or redirected)
@app.get("/app/formula/team_quiz")
async def formula_team_quiz(request: Request):
    return RedirectResponse(url="/app/formula/self_test")

@app.get("/app/formula/matrix")
async def formula_matrix(request: Request):
    return templates.TemplateResponse("formula/matrix.html", {"request": request})

@app.get("/app/formula/mistakes")
async def formula_mistakes(request: Request):
    return templates.TemplateResponse("formula/mistakes.html", {"request": request})

# Channel
@app.get("/app/channel")
async def app_channel(request: Request):
    return templates.TemplateResponse("channel.html", {"request": request})

# Mount specific routes first
app.include_router(router)

# Include admin routes
from web.admin_routes import router as admin_router
app.include_router(admin_router)


# Serve static files
# We need to get absolute path to avoid issues
static_path = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_path), name="static")

# Mount Teremok Landing (Bundled)
teremok_path = os.path.join(os.path.dirname(__file__), "apps/teremok")
if os.path.exists(teremok_path):
    app.mount("/teremok-app", StaticFiles(directory=teremok_path, html=True), name="teremok_app")

# Mount Formula App (Bundled)
formula_path = os.path.join(os.path.dirname(__file__), "apps/formula")
if os.path.exists(formula_path):
    app.mount("/formula-app", StaticFiles(directory=formula_path, html=True), name="formula_app")

# Mount Root Ecosystem (Bundled)
ecosystem_path = os.path.join(os.path.dirname(__file__), "apps/ecosystem")
if os.path.exists(ecosystem_path):
    app.mount("/ecosystem", StaticFiles(directory=ecosystem_path, html=True), name="ecosystem")

from fastapi.responses import RedirectResponse

@app.get("/")
async def read_root():
    """Redirect root to ecosystem hub"""
    return RedirectResponse(url="/ecosystem/index.html")

@app.get("/admin")
async def admin_root():
    """Redirect /admin to /app/admin/dashboard"""
    return RedirectResponse(url="/app/admin/dashboard")



