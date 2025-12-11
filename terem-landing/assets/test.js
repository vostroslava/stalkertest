const teremokTest = {
    questions: [
        {
            id: 1,
            text: "Как сотрудник относится к новым задачам?",
            options: [
                { text: "Ждет четких указаний, сам не проявляет инициативу", type: "bird" },
                { text: "Спрашивает: «А что мне за это будет?»", type: "hamster" },
                { text: "Берется, если это повысит его влияние или статус", type: "fox" },
                { text: "Изучает задачу и предлагает решение", type: "profi" }
            ]
        },
        {
            id: 2,
            text: "Как сотрудник ведет себя при ошибках?",
            options: [
                { text: "Прячет ошибку или обвиняет обстоятельства", type: "bird" },
                { text: "Переживает только за свой штраф", type: "hamster" },
                { text: "Ищет виноватого, выкручивается", type: "fox" },
                { text: "Признает, исправляет и делает выводы", type: "profi" }
            ]
        },
        {
            id: 3,
            text: "Что мотивирует сотрудника работать лучше?",
            options: [
                { text: "Страх наказания или увольнения", type: "bird" },
                { text: "Премия или бонус", type: "hamster" },
                { text: "Публичная похвала, должность, власть", type: "fox" },
                { text: "Интересные задачи и профессиональный рост", type: "profi" }
            ]
        },
        {
            id: 4,
            text: "Как сотрудник взаимодействует с коллегами?",
            options: [
                { text: "Держится обособленно или «кучкуется» с такими же", type: "bird" },
                { text: "Общается, если это выгодно", type: "hamster" },
                { text: "Плетет интриги, создает коалиции", type: "fox" },
                { text: "Помогает, делится опытом, работает на команду", type: "profi" }
            ]
        },
        {
            id: 5,
            text: "Отношение к рабочему времени",
            options: [
                { text: "Опаздывает, ждет конца рабочего дня", type: "bird" },
                { text: "Сидит от звонка до звонка, переработки только за деньги", type: "hamster" },
                { text: "Имитирует бурную деятельность", type: "fox" },
                { text: "Работает на результат, не смотрит на часы", type: "profi" }
            ]
        }
    ],
    
    currentQuestionIndex: 0,
    scores: {
        bird: 0,
        hamster: 0,
        fox: 0,
        profi: 0
    },

    init: function() {
        this.cacheDOM();
        this.bindEvents();
    },

    cacheDOM: function() {
        this.modal = document.getElementById('testModal');
        this.container = document.getElementById('testContainer');
        this.questionCard = document.getElementById('testQuestionCard');
        this.progressBar = document.getElementById('testProgressBar');
        this.resultContainer = document.getElementById('testResultContainer');
        this.telegramBlock = document.getElementById('testTelegramBlock');
    },

    bindEvents: function() {
        // Event delegation for dynamically created buttons
        if (this.questionCard) {
            this.questionCard.addEventListener('click', (e) => {
                if (e.target.classList.contains('test-option-btn')) {
                    const type = e.target.getAttribute('data-type');
                    this.handleAnswer(type);
                }
            });
        }
    },

    startTest: function() {
        this.currentQuestionIndex = 0;
        this.scores = { bird: 0, hamster: 0, fox: 0, profi: 0 };
        this.container.style.display = 'block';
        this.resultContainer.style.display = 'none';
        this.telegramBlock.style.display = 'none';
        this.renderQuestion();
    },

    renderQuestion: function() {
        const question = this.questions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;
        
        this.progressBar.style.width = `${progress}%`;

        let html = `
            <div class="test-question-number">Вопрос ${this.currentQuestionIndex + 1} из ${this.questions.length}</div>
            <h3 class="test-question-text">${question.text}</h3>
            <div class="test-options">
        `;

        question.options.forEach(option => {
            html += `<button class="test-option-btn" data-type="${option.type}">${option.text}</button>`;
        });

        html += `</div>`;
        this.questionCard.innerHTML = html;
    },

    handleAnswer: function(type) {
        if (this.scores.hasOwnProperty(type)) {
            this.scores[type]++;
        }

        this.currentQuestionIndex++;

        if (this.currentQuestionIndex < this.questions.length) {
            this.renderQuestion();
        } else {
            this.showResult();
        }
    },

    showResult: function() {
        this.container.style.display = 'none';
        this.resultContainer.style.display = 'block';
        this.telegramBlock.style.display = 'flex'; // Show Telegram block

        const winner = Object.keys(this.scores).reduce((a, b) => this.scores[a] > this.scores[b] ? a : b);
        
        const resultData = {
            bird: { title: "Птица", icon: "🐦", desc: "Сотрудник требует постоянного контроля. Мотивация — страх наказания." },
            hamster: { title: "Хомяк", icon: "🐹", desc: "Сотрудник работает только за деньги. Мотивация — личная выгода." },
            fox: { title: "Лиса", icon: "🦊", desc: "Сотрудник ищет власти и статуса. Может быть полезен, но требует осторожности." },
            profi: { title: "Профи", icon: "🦁", desc: "Надежный сотрудник. Мотивация — профессионализм и результат." }
        };

        const result = resultData[winner];

        this.resultContainer.innerHTML = `
            <div class="test-result-card">
                <div class="test-result-icon">${result.icon}</div>
                <h3>Ваш сотрудник скорее всего: ${result.title}</h3>
                <p>${result.desc}</p>
                <div class="test-result-chart">
                    ${this.renderChart()}
                </div>
            </div>
        `;

        this.saveResult(winner);
    },

    renderChart: function() {
        // Simple visual representation of scores
        let html = '<div class="result-bars">';
        const maxScore = Math.max(...Object.values(this.scores));
        
        for (const [type, score] of Object.entries(this.scores)) {
            const height = maxScore > 0 ? (score / maxScore) * 100 : 0;
            const labels = { bird: "Птица", hamster: "Хомяк", fox: "Лиса", profi: "Профи" };
            html += `
                <div class="result-bar-item">
                    <div class="result-bar-fill" style="height: ${height}px;"></div>
                    <span class="result-bar-label">${labels[type]}</span>
                </div>
            `;
        }
        html += '</div>';
        return html;
    },

    saveResult: function(result) {
        // Mock database save
        console.log("Saving result to DB:", result, this.scores);
        // Here you would typically fetch() to your backend
        // fetch('/api/save-test', { method: 'POST', body: JSON.stringify({ result, scores: this.scores }) });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    teremokTest.init();
});

// Expose start function globally so it can be called from the form
window.startTeremokTest = function() {
    teremokTest.startTest();
};
