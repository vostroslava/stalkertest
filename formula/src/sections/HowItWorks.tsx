import React from 'react';

export const HowItWorks: React.FC = () => {
    const steps = [
        {
            number: '01',
            title: 'Регистрируетесь на встречу',
            description: 'Оставляете заявку на сайте или по телефону. Мы подтверждаем регистрацию и высылаем все детали: адрес, время, программу и материалы для подготовки.',
            icon: '📝',
        },
        {
            number: '02',
            title: 'Приходите 28 января в 10:00',
            description: 'Встреча проходит в удобном офисе в ТЦ «ЕВРОПА» (г. Минск, ул. Сурганова, 57Б). Длительность: 5 часов с кофе-брейком и нетворкингом.',
            icon: '📍',
        },
        {
            number: '03',
            title: 'Изучаете систему оценки персонала',
            description: 'Узнаете модели поведения (Результатник, Процессник, Статусник), уровни вовлечённости, «Теорию потоков» и «Матрицу системности». Разбираете живые кейсы.',
            icon: '🎓',
        },
        {
            number: '04',
            title: 'Получаете готовые инструменты',
            description: 'Список признаков вовлечённого персонала, формулу расчёта недополученной прибыли, чек-листы для оценки сотрудников. Применяете сразу после встречи.',
            icon: '📊',
        },
    ];

    return (
        <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-6">
                        Как проходит встреча
                    </h2>
                    <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
                        От регистрации до получения готовых инструментов для управления командой
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                            >
                                {/* Step number */}
                                <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div className="text-6xl mb-4 pl-12">{step.icon}</div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Program highlight */}
                    <div className="mt-16 bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl p-10 border border-primary-100">
                        <div className="max-w-4xl mx-auto">
                            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                                📋 Программа встречи (5 часов)
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl p-6 shadow-md">
                                    <h4 className="font-bold text-lg text-primary-700 mb-3">🔍 Теоретическая часть</h4>
                                    <ul className="space-y-2 text-gray-700">
                                        <li>• Модель «Матрица системности»</li>
                                        <li>• Уровни вовлечённости сотрудников</li>
                                        <li>• «Теория потоков» и баланс мотивации</li>
                                        <li>• 3 основных модели поведения</li>
                                    </ul>
                                </div>
                                <div className="bg-white rounded-xl p-6 shadow-md">
                                    <h4 className="font-bold text-lg text-accent-700 mb-3">💼 Практическая часть</h4>
                                    <ul className="space-y-2 text-gray-700">
                                        <li>• Анализ реальных кейсов</li>
                                        <li>• Оценка вашей команды</li>
                                        <li>• Разбор ошибок управления</li>
                                        <li>• Готовые чек-листы и формулы</li>
                                    </ul>
                                </div>
                            </div>
                            <p className="text-center text-gray-600 mt-6">
                                <strong>12:00 - 12:20</strong> — Кофе-брейк и нетворкинг с другими собственниками и руководителями
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
