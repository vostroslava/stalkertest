import type { QuizQuestion, QuizAnswer, ScoreDimensions, ScoreDimension, TestResult, UserContact, ResultInterpretation } from '@/types';

// Mini-quiz questions (3-5 situational questions for engagement)
export const MINI_QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 'mq1',
        text: 'Когда в вашей команде появляется новая задача, что происходит чаще?',
        type: 'multiple-choice',
        options: [
            {
                id: 'mq1-a',
                text: 'Люди сами берут задачу и находят путь к решению',
                points: { rezultatnost: 3, systemnost: 1 },
            },
            {
                id: 'mq1-b',
                text: 'Ждут четких инструкций, как это делать',
                points: { processnost: 3 },
            },
            {
                id: 'mq1-c',
                text: 'Обсуждают, кто будет ответственным и как это выглядит',
                points: { statusnost: 2, processnost: 1 },
            },
        ],
    },
    {
        id: 'mq2',
        text: 'Как члены команды реагируют на изменения в процессах?',
        type: 'multiple-choice',
        options: [
            {
                id: 'mq2-a',
                text: 'Адаптируются быстро, ищут новые возможности',
                points: { rezultatnost: 2, systemnost: 2 },
            },
            {
                id: 'mq2-b',
                text: 'Сопротивляются, требуют времени на обучение',
                points: { processnost: 3 },
            },
            {
                id: 'mq2-c',
                text: 'Интересуются, как это повлияет на их статус',
                points: { statusnost: 3 },
            },
        ],
    },
    {
        id: 'mq3',
        text: 'Что мотивирует ваших сотрудников больше всего?',
        type: 'multiple-choice',
        options: [
            {
                id: 'mq3-a',
                text: 'Достижение амбициозных целей и победа',
                points: { rezultatnost: 3 },
            },
            {
                id: 'mq3-b',
                text: 'Стабильность, понятные правила и процессы',
                points: { processnost: 2, systemnost: 1 },
            },
            {
                id: 'mq3-c',
                text: 'Признание, должность, статусные атрибуты',
                points: { statusnost: 3 },
            },
        ],
    },
    {
        id: 'mq4',
        text: 'Как команда относится к планированию?',
        type: 'multiple-choice',
        options: [
            {
                id: 'mq4-a',
                text: 'Планируют минимально, действуют по ситуации',
                points: { rezultatnost: 2 },
            },
            {
                id: 'mq4-b',
                text: 'Тщательно планируют каждый шаг',
                points: { systemnost: 3, processnost: 1 },
            },
            {
                id: 'mq4-c',
                text: 'Создают красивые презентации планов',
                points: { statusnost: 2 },
            },
        ],
    },
];

// Full diagnostic test questions (12-20 Likert scale questions)
export const FULL_TEST_QUESTIONS: QuizQuestion[] = [
    {
        id: 'ft1',
        text: 'В нашей команде главное — результат, процесс вторичен',
        type: 'likert',
        dimension: 'rezultatnost',
    },
    {
        id: 'ft2',
        text: 'Мы строго следуем регламентам и процедурам',
        type: 'likert',
        dimension: 'processnost',
    },
    {
        id: 'ft3',
        text: 'Статус и должность важны для атмосферы в команде',
        type: 'likert',
        dimension: 'statusnost',
    },
    {
        id: 'ft4',
        text: 'Мы всегда планируем на несколько шагов вперёд',
        type: 'likert',
        dimension: 'systemnost',
    },
    {
        id: 'ft5',
        text: 'Люди мотивированы достижением целей, а не выполнением задач',
        type: 'likert',
        dimension: 'rezultatnost',
    },
    {
        id: 'ft6',
        text: 'Важнее правильно сделать, чем быстро',
        type: 'likert',
        dimension: 'processnost',
    },
    {
        id: 'ft7',
        text: 'Сотрудники ценят возможность карьерного роста',
        type: 'likert',
        dimension: 'statusnost',
    },
    {
        id: 'ft8',
        text: 'У нас есть чёткая система отчётности и метрик',
        type: 'likert',
        dimension: 'systemnost',
    },
    {
        id: 'ft9',
        text: 'Команда готова идти на риск ради большого результата',
        type: 'likert',
        dimension: 'rezultatnost',
    },
    {
        id: 'ft10',
        text: 'Мы предпочитаем проверенные методы работы',
        type: 'likert',
        dimension: 'processnost',
    },
    {
        id: 'ft11',
        text: 'Внешний вид офиса, атрибутика компании важны для команды',
        type: 'likert',
        dimension: 'statusnost',
    },
    {
        id: 'ft12',
        text: 'Мы регулярно анализируем эффективность и оптимизируем процессы',
        type: 'likert',
        dimension: 'systemnost',
    },
    {
        id: 'ft13',
        text: 'Сотрудники часто предлагают новые идеи и улучшения',
        type: 'likert',
        dimension: 'rezultatnost',
    },
    {
        id: 'ft14',
        text: 'У каждого есть чёткий функционал и зона ответственности',
        type: 'likert',
        dimension: 'processnost',
    },
    {
        id: 'ft15',
        text: 'Важно, как команда выглядит в глазах клиентов и партнёров',
        type: 'likert',
        dimension: 'statusnost',
    },
    {
        id: 'ft16',
        text: 'Мы используем данные для принятия решений',
        type: 'likert',
        dimension: 'systemnost',
    },
    {
        id: 'ft17',
        text: 'Команда работает сверхурочно, если нужно достичь цели',
        type: 'likert',
        dimension: 'rezultatnost',
    },
    {
        id: 'ft18',
        text: 'Обучение и развитие навыков — приоритет',
        type: 'likert',
        dimension: 'processnost',
    },
];

// Calculate mini-quiz teaser result
export function calculateMiniQuizResult(answers: QuizAnswer[]): string {
    const scores: ScoreDimensions = {
        rezultatnost: 0,
        processnost: 0,
        statusnost: 0,
        systemnost: 0,
    };

    answers.forEach((answer) => {
        const question = MINI_QUIZ_QUESTIONS.find((q) => q.id === answer.questionId);
        if (question && question.options) {
            const option = question.options.find((opt) => opt.id === answer.answerId);
            if (option) {
                Object.entries(option.points).forEach(([dim, points]) => {
                    scores[dim as ScoreDimension] += points;
                });
            }
        }
    });

    // Determine dominant dimension
    const dominant = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))[0] as ScoreDimension;

    // Return teaser based on dominant type
    const teasers: Record<ScoreDimension, string> = {
        rezultatnost:
            'По вашим ответам видно, что команда ориентирована на результат. Вероятны риски выгорания и недостатка процессности. Чтобы увидеть полную картину и получить конкретные рекомендации, пройдите расширенную диагностику.',
        processnost:
            'Ваша команда сфокусирована на процессах и исполнении. Есть риски недостаточной инициативности и медленной адаптации. Пройдите полный тест для детального анализа и рекомендаций.',
        statusnost:
            'По вашим ответам заметно влияние статусности в команде. Это может тормозить инновации и создавать внутренние конфликты. Получите полную диагностику для управленческих решений.',
        systemnost:
            'Команда демонстрирует системность и структурированность. Важно убедиться, что это не переходит в бюрократию. Пройдите расширенный тест для полной карты команды.',
    };

    return teasers[dominant];
}

// Calculate full test scores
export function calculateFullTestScores(answers: QuizAnswer[]): ScoreDimensions {
    const dimensionScores: Record<ScoreDimension, number[]> = {
        rezultatnost: [],
        processnost: [],
        statusnost: [],
        systemnost: [],
    };

    answers.forEach((answer) => {
        const question = FULL_TEST_QUESTIONS.find((q) => q.id === answer.questionId);
        if (question && question.dimension && answer.value) {
            if (Array.isArray(question.dimension)) {
                question.dimension.forEach((dim) => {
                    dimensionScores[dim].push(answer.value!);
                });
            } else {
                dimensionScores[question.dimension].push(answer.value);
            }
        }
    });

    // Calculate average and normalize to 0-100
    const scores: ScoreDimensions = {} as ScoreDimensions;
    Object.entries(dimensionScores).forEach(([dim, values]) => {
        if (values.length > 0) {
            const average = values.reduce((a, b) => a + b, 0) / values.length;
            // Likert scale is 1-5, normalize to 0-100
            scores[dim as ScoreDimension] = ((average - 1) / 4) * 100;
        } else {
            scores[dim as ScoreDimension] = 0;
        }
    });

    return scores;
}

// Get dominant dimension
export function getDominantDimension(scores: ScoreDimensions): ScoreDimension {
    return Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))[0] as ScoreDimension;
}

// Generate result interpretation
export function generateInterpretation(scores: ScoreDimensions): ResultInterpretation {
    const dominant = getDominantDimension(scores);

    const interpretations: Record<ScoreDimension, ResultInterpretation> = {
        rezultatnost: {
            title: 'Команда-Результатники',
            profile:
                'Ваша команда ориентирована на достижение целей и результатов. Люди ценят скорость, конкретные победы и готовы брать на себя ответственность. Сотрудники мотивированы вызовами и амбициозными задачами.',
            risks: [
                'Может страдать качество процессов и документации',
                'Высокий риск выгорания при длительных проектах',
                'Возможны конфликты из-за «срезания углов»',
                'Сложности с масштабированием успешных практик',
            ],
            recommendations: [
                'Внедрите базовые процессы для повторяющихся задач',
                'Балансируйте краткосрочные победы и долгосрочную устойчивость',
                'Создайте систему документирования лучших практик',
                'Следите за work-life balance команды',
            ],
        },
        processnost: {
            title: 'Команда-Процессники',
            profile:
                'Ваша команда сфокусирована на качественном выполнении задач по установленным процессам. Люди ценят чёткие инструкции, регламенты и последовательность. Сотрудники оценивают себя по вложенным усилиям и старанию.',
            risks: [
                'Недостаточная инициативность и гибкость',
                'Медленная адаптация к изменениям',
                'Фокус на процессе, а не на результате',
                'Риск «паралича анализа» при новых задачах',
            ],
            recommendations: [
                'Поощряйте инициативу и предложения улучшений',
                'Установите метрики результата, не только процесса',
                'Создайте пространство для экспериментов',
                'Внедрите быстрые циклы обратной связи',
            ],
        },
        statusnost: {
            title: 'Команда с высокой Статусностью',
            profile:
                'В вашей команде важны должности, статус и внешнее восприятие. Люди ценят признание, карьерный рост и престиж. Команда хорошо «продаёт» идеи и проекты, создаёт привлекательный образ.',
            risks: [
                'Видимость деятельности важнее реальных результатов',
                'Политики и интриги вместо работы',
                'Сопротивление «грязной работе»',
                'Завышенные ожидания по компенсациям',
            ],
            recommendations: [
                'Установите объективные KPI результатов',
                'Создайте прозрачную систему роста',
                'Поощряйте реальные достижения, не презентации',
                'Развивайте культуру равенства и взаимопомощи',
            ],
        },
        systemnost: {
            title: 'Системная команда',
            profile:
                'Ваша команда демонстрирует структурированность, аналитичность и планирование. Люди ценят данные, метрики и системный подход. Сотрудники работают на несколько шагов вперёд, оптимизируют процессы.',
            risks: [
                'Излишняя бюрократия и формализм',
                'Медленное принятие решений',
                'Недостаток гибкости при форс-мажорах',
                '«Паралич планирования» вместо действий',
            ],
            recommendations: [
                'Балансируйте планирование и быстрые запуски',
                'Создайте механизмы быстрых решений',
                'Поощряйте разумный риск и эксперименты',
                'Упрощайте процессы, убирайте лишнее',
            ],
        },
    };

    return interpretations[dominant];
}

// Calculate complete test result
export function calculateTestResult(contact: UserContact, answers: QuizAnswer[]): TestResult {
    const scores = calculateFullTestScores(answers);
    const dominant = getDominantDimension(scores);
    const interpretation = generateInterpretation(scores);

    return {
        scores,
        dominantDimension: dominant,
        dominantPercentage: scores[dominant],
        interpretation,
        contact,
        answers,
        timestamp: new Date().toISOString(),
    };
}
