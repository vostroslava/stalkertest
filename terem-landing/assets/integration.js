/**
 * Integration with Stalker Ecosystem Bot
 * Handles Lead Registration and Mini-Test via Unified API
 */

// Configuration
const API_BASE = (window.__API_BASE__ && typeof window.__API_BASE__ === 'string')
    ? window.__API_BASE__.replace(/\/+$/, '')
    : 'http://localhost:8000/api';
const LEAD_ID_KEY = 'teremok_lead_id';

// State
let currentQuestions = [];
let currentQIndex = 0;
let currentAnswers = {}; // { q_id: option_index }

// Helper to make API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return data;
}

// 1. Handle Contact Form Submission
async function handleContactSubmit(e) {
    e.preventDefault();

    // Spam Protection (Safe Check)
    try {
        if (localStorage.getItem('teremok_lead_submitted_flag')) {
            alert('Вы уже отправляли заявку. Переходим к тесту.');
            if (window.closeLeadModal) window.closeLeadModal();
            if (window.openTestModal) window.openTestModal();
            return;
        }
    } catch (e) {
        console.warn('Storage check failed', e);
    }

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Consent Validation
    const formData = new FormData(form);
    if (formData.get('privacyConsent') !== 'on') {
        alert('Подтвердите согласие на обработку данных.');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);

    const payload = {
        name: formData.get('name'),
        role: formData.get('role'),
        company: formData.get('company'),
        team_size: formData.get('team_size'),
        email: formData.get('email'),

        // Standardized Fields
        phone_or_messenger: formData.get('phone'),
        preferred_channel: formData.get('messenger') || 'telegram',
        comment: formData.get('request'),

        consent: formData.get('privacyConsent') === 'on',
        product: 'teremok',
        source: 'terem_landing',

        // Full UTM support
        utm_source: urlParams.get('utm_source') || '',
        utm_medium: urlParams.get('utm_medium') || '',
        utm_campaign: urlParams.get('utm_campaign') || '',
        utm_content: urlParams.get('utm_content') || '',
        utm_term: urlParams.get('utm_term') || ''
    };

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        // Register Lead
        const result = await apiRequest('/lead/register', 'POST', payload);
        console.log('Registration result:', result);

        if (result.status === 'success') {
            // Save ID (Safe)
            const leadId = result.lead_id ?? result.user_id ?? result.id;
            console.log('Lead registered:', leadId);

            try {
                if (leadId) sessionStorage.setItem(LEAD_ID_KEY, String(leadId));
                localStorage.setItem('teremok_lead_submitted_flag', 'true');
            } catch (err) {
                console.warn('Storage save failed:', err);
            }

            // Close Contact Modal & Open Test
            setTimeout(() => {
                if (window.closeLeadModal) window.closeLeadModal();
                if (window.openTestModal) window.openTestModal();
            }, 100);

        } else {
            alert('Ошибка регистрации: ' + (result.message || 'Неизвестная ошибка'));
        }

    } catch (err) {
        console.error('Submission Error:', err);
        alert('Произошла ошибка при отправке данных. Попробуйте позже.');
    } finally {
        // ALWAYS restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 2. Initialize Mini-Test
async function initMiniTest() {
    const leadId = sessionStorage.getItem(LEAD_ID_KEY);
    // If no lead ID, app.js logic normally redirects to registration.

    const container = document.getElementById('testQuestionCard');
    if (!container) return; // Should not happen if modal is open

    container.innerHTML = '<div class="loading">Загрузка вопросов...</div>';

    try {
        // Fetch Questions from Unified Endpoint
        const data = await apiRequest('/teremok/questions', 'GET');

        if (data && data.questions) {
            currentQuestions = data.questions;
            currentQIndex = 0;
            currentAnswers = {};
            renderCurrentQuestion();
        } else {
            container.innerHTML = 'Ошибка загрузки вопросов.';
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = 'Не удалось загрузить тест. Попробуйте позже.';
    }
}

function renderCurrentQuestion() {
    const container = document.getElementById('testQuestionCard');
    const progressBar = document.getElementById('testProgressBar');

    if (!currentQuestions || currentQuestions.length === 0) return;

    const question = currentQuestions[currentQIndex];

    // Update Progress
    if (progressBar) {
        const progress = ((currentQIndex) / currentQuestions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Render HTML
    let html = `<h3>${question.text}</h3><div class="test-options">`;
    question.options.forEach((opt, idx) => {
        // data-index is the option index
        html += `<button class="test-option-btn" onclick="Integration.handleOptionClick('${question.id}', ${idx})">
            ${opt.text}
        </button>`;
    });
    html += `</div>`;

    container.innerHTML = html;
}

async function handleOptionClick(qId, optionIndex) {
    currentAnswers[qId] = optionIndex;
    currentQIndex++;

    if (currentQIndex < currentQuestions.length) {
        renderCurrentQuestion();
    } else {
        await finishTest();
    }
}

async function finishTest() {
    const container = document.getElementById('testQuestionCard');
    if (container) container.innerHTML = '<div class="loading">Обработка результатов...</div>';

    const progressBar = document.getElementById('testProgressBar');
    if (progressBar) progressBar.style.width = '100%';

    const leadId = sessionStorage.getItem(LEAD_ID_KEY);

    try {
        const payload = {
            user_id: parseInt(leadId, 10), // Ensure integer if possible
            answers: currentAnswers
        };

        const result = await apiRequest('/test/submit', 'POST', payload);

        if (result.status === 'success') {
            renderResult(result);
        } else {
            throw new Error(result.message);
        }

    } catch (e) {
        console.error(e);
        container.innerHTML = 'Ошибка при отправке ответов: ' + e.message;
    }
}

function renderResult(result) {
    const container = document.getElementById('testContainer');
    const resultContainer = document.getElementById('testResultContainer');
    const telegramBlock = document.getElementById('testTelegramBlock');

    if (container) container.style.display = 'none';

    const info = result.result_info || {};
    const title = info.title || result.result_type;
    const desc = info.description || 'Тест завершен';
    const fullDesc = info.full_description || '';

    if (resultContainer) {
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = `
            <div class="result-card">
                <div class="result-header">
                     <h2 class="result-title">${title}</h2>
                     <p class="result-subtitle">Ваш преобладающий типаж</p>
                </div>
                <div class="result-section">
                    <h4>Описание</h4>
                    <p>${desc}</p>
                    ${fullDesc ? `<p class="result-full-desc">${fullDesc}</p>` : ''}
                </div>
            </div>
        `;
    }

    if (telegramBlock) {
        telegramBlock.style.display = 'flex';
        const linkBtn = telegramBlock.querySelector('a.telegram-button');
        if (linkBtn) {
            // bot-tg is typically at t.me/teremok_manager_bot, but we can't hardcode if unknown.
            // But we can check result structure or default to a safe bot.
            // The HTML has t.me/stalkermedia1 by default.
            // We'll append start param for result.
            // Assuming the bot handles deep linking.
            linkBtn.href = "https://t.me/teremok_manager_bot?start=result_" + result.result_id;
            linkBtn.textContent = 'Подробнее в Telegram-боте';
            linkBtn.target = '_blank';
        }
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('leadForm');
    if (form) {
        form.addEventListener('submit', handleContactSubmit);
    }

    // Expose for HTML onClick
    window.Integration = {
        handleOptionClick
    };

    // Allow app.js to call init
    window.initMiniTest = initMiniTest;
});
