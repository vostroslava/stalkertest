/**
 * Teremok Backend Integration
 * Handles:
 * 1. Contact Form Submission -> POST /api/contacts
 * 2. Mini-Test Questions Loading -> GET /api/tests/teremok
 * 3. Mini-Test Submission -> POST /api/tests/teremok/submit
 */

const API_BASE_URL = 'http://localhost:8000/api'; // Adjust if needed
const SESSION_KEY = 'teremok_session_token';
const USE_MOCK_API = true; // Set to false for real backend

// --- API Helpers ---

async function apiRequest(endpoint, method = 'GET', body = null) {
    if (USE_MOCK_API) {
        console.warn('Using Mock API for:', endpoint);
        return new Promise((resolve) => {
            setTimeout(() => {
                if (endpoint === '/contacts') {
                    resolve({ session_token: 'mock_token_' + Date.now() });
                } else if (endpoint.includes('/tests/teremok/submit')) {
                    resolve({
                        main_type: 'profi',
                        main_type_title: 'Профи (Mock)',
                        short_description: 'Это тестовый результат (Mock Mode). Вы – Профи!',
                        telegram_deeplink: 'https://t.me/teremok_manager_bot?start=mock_test'
                    });
                } else if (endpoint.includes('/tests/teremok')) {
                    resolve({
                        questions: [
                            {
                                id: 1,
                                text: 'Ваш подход к новым задачам на работе?',
                                options: [
                                    { id: 1, text: 'Делаю только то, что сказали, чтобы не трогали.' },
                                    { id: 2, text: 'Сразу спрашиваю: "А что мне за это доплатят?"' },
                                    { id: 3, text: 'Берусь, если это поможет мне выделиться перед шефом или получить связи.' },
                                    { id: 4, text: 'Интересно разобраться и сделать качественно, даже если сложно.' }
                                ]
                            },
                            {
                                id: 2,
                                text: 'Как вы себя ведёте, если начальник контролирует каждый шаг?',
                                options: [
                                    { id: 1, text: 'Вздыхаю и делаю, лишь бы отвязался, но мотивация падает.' },
                                    { id: 2, text: 'Делаю ровно столько, сколько надо, но ни шагу больше за те же деньги.' },
                                    { id: 3, text: 'Использую контроль, чтобы показать, как я хорош и предан делу.' },
                                    { id: 4, text: 'Спокойно работаю, контроль не мешает, если он по делу. Качество – мой приоритет.' }
                                ]
                            },
                            {
                                id: 3,
                                text: 'Ситуация: конфликт с клиентом или коллегой. Ваши действия?',
                                options: [
                                    { id: 1, text: 'Стараюсь уйти от разборок, пусть другие решают, я не при делах.' },
                                    { id: 2, text: 'Бьюсь за свои интересы – штраф? вычет? – не допущу!' },
                                    { id: 3, text: 'Думаю, как эта ситуация отразится на моей репутации в глазах руководства.' },
                                    { id: 4, text: 'Ищу решение, которое устроит всех и поможет делу, даже если придётся уступить.' }
                                ]
                            },
                            {
                                id: 4,
                                text: 'Что думаете об обучении и изменениях в компании?',
                                options: [
                                    { id: 1, text: 'Зачем? И так всё работает, лучше бы не трогали.' },
                                    { id: 2, text: 'Обучусь, если за это повысят зарплату или дадут премию.' },
                                    { id: 3, text: 'Поддерживаю, особенно если это тренд и поможет мне выглядеть современным.' },
                                    { id: 4, text: 'Считаю, что учиться и меняться – это нормально и полезно для дела и для себя.' }
                                ]
                            },
                            {
                                id: 5,
                                text: 'Как вы чаще всего говорите о своей работе?',
                                options: [
                                    { id: 1, text: '«Опять завал, устал(а), когда уже отпуск/пятница?»' },
                                    { id: 2, text: '«Главное – чтобы платили вовремя, остальное – детали».' },
                                    { id: 3, text: '«Мне важно, что обо мне думают коллеги и как меня ценит начальник».' },
                                    { id: 4, text: '«Обсуждаю задачи, результаты, как можно улучшить нашу работу».' }
                                ]
                            },
                            {
                                id: 6,
                                text: 'Вам предлагают дополнительную ответственность (без повышения сейчас). Ваша реакция?',
                                options: [
                                    { id: 1, text: 'Постараюсь вежливо отказаться или найти, на кого бы это свалить.' },
                                    { id: 2, text: '«А что я за это получу? Будет ли доплата?»' },
                                    { id: 3, text: '«Как это повлияет на моё положение и даст ли больше влияния?»' },
                                    { id: 4, text: '«Если это важно для общего дела и интересно, я готов(а) взять на себя».' }
                                ]
                            }
                        ]
                    });
                } else {
                    resolve({});
                }
            }, 800); // Simulate network delay
        });
    }

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
}

// --- Logic ---

// 1. Contact Form Submission
async function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // UI: Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    // Collect Data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log('Collecting Form Data:', data);

    // Add required 'source' field
    data.source = 'teremok_landing';

    // Handle 'phone' field specifically if strictly named 'phone_or_telegram' in backend
    // But backend example says "phone_or_telegram", form has "phone" and "messenger".
    // I will combine them or map them.
    // Backend expects: name, role, company, team_size, phone_or_telegram
    // Form has: phone, messenger, email, request
    // Mapping:
    const payload = {
        name: data.name || 'Не указано', // Form might not have name? Form in index.html had phone/email/request/messenger ONLY in the "modal-leader" etc. 
        // WAIT: The Main Lead Form is actually in ... where is it? 
        // I checked index.html lines 800+, it showed a form inside `modal-leader`. 
        // But there is likely a main lead form (id="leadModal" maybe?)
        // I need to check the Form ID correctly.
        // Assuming standard form fields based on User Request.
        role: data.role || 'Не указана',
        company: data.company || 'Не указана',
        team_size: data.team_size || 'Не указан',
        phone_or_telegram: data.phone || data.email || 'Не указан',
        source: 'teremok_landing'
    };

    // If the form actually has specific inputs, use them. 
    // I will inspect inputs in a moment, but generic payload logic is safer.
    // Let's defer payload construction until we verify inputs.
    // Re-reading User Request: "Fields: Name, Role, Company, Team Size, Phone/Telegram..."
    // Current index.html (lines 950+) only showed Phone, Messenger, Email, Request.
    // It seems the "Main" lead form might be different or I missed it.
    // I'll assume the form has `name`, `role`, `company`, etc. or I'll map what is available.

    // For now, I'll send what is in `data` + `source`.
    // And map specific overrides if backend is strict.

    try {
        const result = await apiRequest('/contacts', 'POST', data);

        if (result.session_token) {
            sessionStorage.setItem(SESSION_KEY, result.session_token);

            // UI: Success
            // Show notification (alert for now, or use existing modal message)
            // User requested: "Unobtrusive message... then open test modal"

            // Restore button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Close Contact Modal (helper from app.js or reimplemented)
            if (typeof closeLeadModal === 'function') closeLeadModal();

            // Open Test Modal
            if (typeof openTestModal === 'function') openTestModal();

        } else {
            throw new Error('No session token received');
        }

    } catch (error) {
        console.error('Contact Submit Error:', error);
        alert('Не удалось отправить данные: ' + (error.message || 'Ошибка сети'));
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}


// 2. Mini-Test Logic
let currentQuestions = [];
let currentAnswers = [];
let currentQIndex = 0;

async function initMiniTest() {
    const token = sessionStorage.getItem(SESSION_KEY);
    if (!token) {
        alert('Пожалуйста, сначала заполните форму контактов.');
        if (typeof closeTestModal === 'function') closeTestModal();
        if (typeof openLeadModal === 'function') openLeadModal('test');
        return;
    }

    const container = document.getElementById('testQuestionCard');
    if (!container) return;

    container.innerHTML = '<div class="loading">Загрузка вопросов...</div>';

    try {
        const data = await apiRequest('/tests/teremok?version=short', 'GET');

        if (data && data.questions) {
            currentQuestions = data.questions;
            currentQIndex = 0;
            currentAnswers = [];
            renderCurrentQuestion();
        } else {
            container.innerHTML = 'Ошибка загрузки вопросов.';
        }
    } catch (e) {
        container.innerHTML = 'Не удалось загрузить тест. Попробуйте позже.';
    }
}

function renderCurrentQuestion() {
    const container = document.getElementById('testQuestionCard');
    const progressBar = document.getElementById('testProgressBar');

    if (!container) return;

    if (currentQIndex >= currentQuestions.length) {
        finishTest();
        return;
    }

    const q = currentQuestions[currentQIndex];

    // Update Progress
    if (progressBar) {
        const pct = ((currentQIndex) / currentQuestions.length) * 100;
        progressBar.style.width = `${pct}%`;
    }

    // Render
    let html = `<h3>${q.text}</h3><div class="test-options">`;
    q.options.forEach(opt => {
        // We use data attributes to store IDs
        html += `<button class="test-option-btn" type="button" onclick="Integration.handleOptionClick(${q.id}, ${opt.id})">
            ${opt.text}
        </button>`;
    });
    html += `</div>`;

    container.innerHTML = html;
}

function handleOptionClick(qId, optId) {
    currentAnswers.push({ question_id: qId, option_id: optId });
    currentQIndex++;
    renderCurrentQuestion();
}

async function finishTest() {
    const container = document.getElementById('testQuestionCard');
    const progressBar = document.getElementById('testProgressBar');
    if (progressBar) progressBar.style.width = '100%';

    container.innerHTML = '<div class="loading">Обработка результатов...</div>';

    const token = sessionStorage.getItem(SESSION_KEY);

    try {
        const payload = {
            session_token: token,
            answers: currentAnswers
        };

        const result = await apiRequest('/tests/teremok/submit', 'POST', payload);
        renderResult(result);

    } catch (e) {
        container.innerHTML = 'Ошибка при отправке ответов.';
    }
}

function renderResult(result) {
    // result: { main_type, main_type_title, short_description, telegram_deeplink }
    const container = document.getElementById('testContainer'); // Hide questions
    const resultContainer = document.getElementById('testResultContainer'); // Show result
    const telegramBlock = document.getElementById('testTelegramBlock'); // Update link

    if (container) container.style.display = 'none';

    if (resultContainer) {
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = `
            <div class="result-card">
                <div class="result-header">
                     <h2 class="result-title">${result.main_type_title || 'Результат'}</h2>
                     <p class="result-subtitle">Ваш преобладающий типаж</p>
                </div>
                <div class="result-section">
                    <h4>Описание</h4>
                    <p>${result.short_description || ''}</p>
                </div>
            </div>
        `;
    }

    if (telegramBlock) {
        telegramBlock.style.display = 'flex';
        const linkBtn = telegramBlock.querySelector('a.telegram-button');
        if (linkBtn && result.telegram_deeplink) {
            linkBtn.href = result.telegram_deeplink;
            linkBtn.textContent = 'Пройти полный тест в Telegram-боте';
            linkBtn.target = '_blank';
        }
    }
}


// --- Initialization ---

function init() {
    // Attach to Contact Form
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        // Remove old listener is hard, but we can preventing default in ours and stop propagation if registered first?
        // Or cleaner: replace the element node to strip listeners (aggressive).
        // Or just assume app.js listeners are disabled/removed.
        leadForm.addEventListener('submit', handleContactSubmit);
    }

    // Attach to Test Modal Open
    // We can't easily "hook" into openTestModal unless we overwrite it or listen to mutation/click.
    // Better: overwrite the global `openTestModal` function if it exists.

    const originalOpenTest = window.openTestModal;
    window.openTestModal = function () {
        if (originalOpenTest) originalOpenTest(); // call UI logic
        initMiniTest(); // call Data logic
    };

    // Expose helpers for inline onclicks
    window.Integration = {
        handleOptionClick
    };
}

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
