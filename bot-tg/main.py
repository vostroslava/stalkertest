
from aiogram import Bot, Dispatcher
import logging
import asyncio
from core.config import settings
from bot.handlers import common, materials, diagnostics, lead_form, admin
from core.database import ensure_db_exists
from core.logging_config import setup_logging
from infrastructure.db import db
import uvicorn
from web.routes import app as web_app
from web.routes import set_bot

# Setup logging
setup_logging(log_level="INFO", log_file="teremok.log")
logger = logging.getLogger(__name__)

async def start_bot(bot: Bot, dp: Dispatcher):
    print("🤖 Бот запускается...")
    # Include routers
    dp.include_router(admin.router)  # Admin commands first
    dp.include_router(common.router)
    dp.include_router(lead_form.router)
    
    # Pass bot instance to web routes for notifications
    set_bot(bot)
    
    # Update Menu Button
    from aiogram.types import MenuButtonWebApp, WebAppInfo
    if settings.WEB_APP_URL:
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="🚀 Открыть приложение",
                web_app=WebAppInfo(url=settings.WEB_APP_URL.rstrip('/') + "/app/hub")
            )
        )
        print(f"Updated Menu Button to: {settings.WEB_APP_URL}")
    
    await dp.start_polling(bot)

async def start_web():
    # To run web app in the same loop, we can use uvicorn.Server with config
    config = uvicorn.Config(web_app, host=settings.HOST, port=settings.PORT, log_level="info", reload=False) # reload=False for asyncio.gather safety usually, but True works if independent
    server = uvicorn.Server(config)
    print(f"🌍 Web App запускается на http://{settings.HOST}:{settings.PORT}")
    await server.serve()

async def main():
    logging.basicConfig(level=logging.INFO)
    
    # Initialize Database Pool
    await db.connect()
    
    # Init DB Schema
    await ensure_db_exists()
    
    bot = Bot(token=settings.BOT_TOKEN)
    dp = Dispatcher()
    
    try:
        # Run both
        await asyncio.gather(
            start_bot(bot, dp),
            start_web()
        )
    finally:
        # Close pool on exit
        await db.disconnect()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот остановлен")
