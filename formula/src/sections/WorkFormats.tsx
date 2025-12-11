import React from 'react';

interface WorkFormatsProps {
    onOpenConsultation: () => void;
}

export const WorkFormats: React.FC<WorkFormatsProps> = ({ onOpenConsultation }) => {
    const format = {
        title: 'Офлайн мероприятие',
        icon: '🎯',
        price: 'От 150 000 ₽',
        duration: '1 день',
        gradient: 'from-primary-600 to-accent-600',
        features: [
            'Полная диагностика команды',
            'Интерактивный разбор результатов',
            'Практические упражнения и кейсы',
            'Индивидуальные рекомендации каждому участнику',
            'Детальный отчет по команде',
            'План развития на 3-6 месяцев',
        ],
        ideal: 'Для компаний, желающих глубоко погрузиться в методику и получить максимальную пользу',
    };

    return (
        <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50 to-transparent opacity-30"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            Формат{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                                работы
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Офлайн мероприятие с полным погружением в методику и практическими результатами
                        </p>
                    </div>

                    {/* Format Card */}
                    <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                        {/* Icon & Title */}
                        <div className={`p-12 bg-gradient-to-br ${format.gradient} text-white text-center`}>
                            <div className="text-7xl mb-6">{format.icon}</div>
                            <h3 className="text-3xl font-bold mb-4">{format.title}</h3>
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <span className="text-4xl font-bold">{format.price}</span>
                            </div>
                            <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-base">
                                ⏱ {format.duration}
                            </div>
                        </div>

                        <div className="p-12">
                            {/* Features */}
                            <ul className="space-y-5 mb-8">
                                {format.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <span className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${format.gradient} flex items-center justify-center`}>
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="text-base text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Ideal for */}
                            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                                <p className="text-sm text-gray-500 font-semibold mb-2 uppercase">Подходит для:</p>
                                <p className="text-base text-gray-700">{format.ideal}</p>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={onOpenConsultation}
                                className={`w-full px-8 py-5 bg-gradient-to-r ${format.gradient} text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                            >
                                Оставить заявку
                            </button>
                        </div>
                    </div>

                    {/* Additional info */}
                    <div className="mt-16 bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl p-10 text-center border border-primary-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Хотите узнать подробности?
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Расскажите о вашей команде и задачах, и мы подробно расскажем о программе мероприятия. Первая консультация — бесплатно.
                        </p>
                        <button
                            onClick={onOpenConsultation}
                            className="px-10 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                            Получить консультацию
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
