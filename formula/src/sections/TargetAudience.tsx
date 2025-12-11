import React from 'react';

interface TargetAudienceProps {
    onStartQuiz: () => void;
    onOpenConsultation: () => void;
}

export const TargetAudience: React.FC<TargetAudienceProps> = ({ onStartQuiz, onOpenConsultation }) => {
    const personas = [
        {
            title: 'Собственник бизнеса',
            icon: '👔',
            gradient: 'from-blue-500 to-cyan-500',
            benefits: [
                'Понять, на кого можно положиться в критических ситуациях',
                'Увидеть скрытые риски в команде до того, как они станут проблемой',
                'Получить объективный план развития ключевых людей',
                'Снизить зависимость от «незаменимых» сотрудников',
            ],
            example: 'Собственник IT-компании обнаружил, что его «звёздный» CTO — статусник, который блокирует рост команды.',
        },
        {
            title: 'Руководитель отдела продаж',
            icon: '📈',
            gradient: 'from-emerald-500 to-teal-500',
            benefits: [
                'Выявить, кто реально продаёт, а кто имитирует бурную деятельность',
                'Снизить текучесть менеджеров и повысить результаты',
                'Понять, как мотивировать каждого — результатом или стабильностью',
                'Правильно распределить роли: хантеры vs фермеры',
            ],
            example: 'Коммерческий директор разделил отдел на результатников (новые клиенты) и процессников (удержание). План вырос на 18%.',
        },
        {
            title: 'HR-менеджер / Тренер',
            icon: '🎯',
            gradient: 'from-purple-500 to-pink-500',
            benefits: [
                'Получить объективную карту команды, а не субъективные мнения',
                'Выстроить персональные треки развития под типы сотрудников',
                'Обосновать HR-инициативы реальными цифрами и данными',
                'Предсказать риски увольнений и выгорания',
            ],
            example: 'HR-менеджер показал CEO данные диагностики и получил бюджет на обучение процессников новым навыкам.',
        },
    ];

    return (
        <section id="target-audience" className="py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            Для кого эта{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                                диагностика
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Методика помогает разным ролям решать свои уникальные задачи управления командой
                        </p>
                    </div>

                    {/* Persona Cards */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {personas.map((persona, idx) => (
                            <div
                                key={idx}
                                className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                            >
                                {/* Gradient overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${persona.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                                {/* Icon */}
                                <div className="relative mb-6">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${persona.gradient} flex items-center justify-center text-4xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                        {persona.icon}
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 relative">
                                    {persona.title}
                                </h3>

                                {/* Benefits */}
                                <ul className="space-y-3 mb-6 relative">
                                    {persona.benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-600">
                                            <span className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${persona.gradient} flex items-center justify-center`}>
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </span>
                                            <span className="text-sm leading-relaxed">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Example case */}
                                <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 mb-6 border border-gray-100">
                                    <p className="text-xs text-gray-500 font-semibold mb-2">ПРИМЕР ИЗ ПРАКТИКИ</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">{persona.example}</p>
                                </div>

                                {/* CTAs */}
                                <div className="relative flex flex-col gap-3">
                                    <button
                                        onClick={onStartQuiz}
                                        className={`w-full px-6 py-3 bg-gradient-to-r ${persona.gradient} text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                                    >
                                        Пройти тест
                                    </button>
                                    <button
                                        onClick={onOpenConsultation}
                                        className="w-full px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                                    >
                                        Записаться на разбор →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
