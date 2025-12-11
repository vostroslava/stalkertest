import React from 'react';
import { Accordion } from '../components/ui/Accordion';

export const FAQ: React.FC = () => {
    const faqItems = [
        {
            id: 'faq1',
            question: 'Сколько времени займёт диагностика?',
            answer: 'Экспресс-тест займёт всего 7-10 минут. Полная диагностика с детальными рекомендациями — 15-20 минут. Вы можете пройти тест в любое удобное время и вернуться к нему позже.',
        },
        {
            id: 'faq2',
            question: 'Можно ли пройти для маленькой команды?',
            answer: 'Да, методика работает для команд от 3 человек. Даже для небольших команд диагностика покажет типы сотрудников, риски и точки роста. Чем больше команда, тем детальнее будет карта.',
        },
        {
            id: 'faq3',
            question: 'Нужен ли HR-специалист для проведения?',
            answer: 'Нет, тест проходит каждый сотрудник самостоятельно онлайн. Как руководитель, вы получите сводные результаты и рекомендации. При желании мы поможем с интерпретацией на консультации.',
        },
        {
            id: 'faq4',
            question: 'Что если у нас уже есть система оценки?',
            answer: '«Формула успешной команды» не заменяет, а дополняет классические системы оценки. Мы фокусируемся на типах мотивации, способах работы и вовлечённости — тех аспектах, которые часто упускают традиционные методики.',
        },
        {
            id: 'faq5',
            question: 'Как быстро получим результаты?',
            answer: 'Результаты доступны мгновенно после прохождения теста. Вы сразу увидите карту команды и базовые рекомендации. Для детального разбора с экспертом потребуется 1-2 рабочих дня на согласование времени консультации.',
        },
        {
            id: 'faq6',
            question: 'Это конфиденциально?',
            answer: 'Да, все данные защищены и используются только для формирования вашего отчёта. Индивидуальные результаты сотрудников видны только им самим. Руководитель получает сводную аналитику без персональной привязки.',
        },
        {
            id: 'faq7',
            question: 'Сколько это стоит?',
            answer: 'Экспресс-диагностика полностью бесплатна. Вы сразу получите базовые результаты и рекомендации. Детальный разбор с экспертом, программы развития команды и корпоративные решения — по индивидуальному запросу.',
        },
    ];

    return (
        <section id="faq" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-6">
                        Часто задаваемые вопросы
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-12">
                        Ответы на вопросы, которые помогут вам принять решение
                    </p>

                    <Accordion items={faqItems} />

                    {/* Final CTA */}
                    <div className="mt-16 text-center p-10 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Остались вопросы?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Пройдите экспресс-диагностику прямо сейчас или запишитесь на консультацию с экспертом
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="#mini-quiz"
                                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
                            >
                                Пройти экспресс-диагностику
                            </a>
                            <a
                                href="#consultation"
                                className="px-8 py-4 border-2 border-primary-600 text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-all"
                            >
                                Записаться на разбор
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
