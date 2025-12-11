import React from 'react';

export const CaseStudies: React.FC = () => {
    const cases = [
        {
            company: 'IT-компания, 35 человек',
            industry: 'Разработка ПО',
            icon: '💻',
            before: {
                title: 'ДО диагностики',
                problems: [
                    'Текучесть 40% в год — люди уходили через 6-8 месяцев',
                    'Постоянные конфликты между отделами разработки и продаж',
                    'Проекты срывались из-за «звёздных» разработчиков, которые не работали в команде',
                ],
            },
            diagnosis: 'Диагностика показала доминирование «Статусников» в руководстве и критический недостаток системности. Ключевые разработчики оказались результатниками, которых душила бюрократия.',
            actions: [
                'Перераспределили роли: убрали статусников с технических позиций',
                'Внедрили прозрачные KPI вместо субъективных оценок',
                'Создали автономные команды для результатников',
            ],
            after: {
                title: 'РЕЗУЛЬТАТ за 6 месяцев',
                metrics: [
                    { value: '12%', label: 'Текучесть снизилась до' },
                    { value: '+25%', label: 'Рост выручки' },
                    { value: '85%', label: 'Проекты в срок' },
                ],
            },
            gradient: 'from-blue-600 to-cyan-600',
        },
        {
            company: 'Отдел продаж B2B, 12 менеджеров',
            industry: 'Оптовая торговля',
            icon: '📊',
            before: {
                title: 'ДО диагностики',
                problems: [
                    'План выполнялся на 60-70%, непонятно кто тормозит',
                    'Все менеджеры делали «всё», но никто не закрывал крупные сделки',
                    'Высокая текучесть — за год ушло 5 человек из 12',
                ],
            },
            diagnosis: 'Тест выявил: 3 «Результатника» тянули весь план, остальные 9 — «Процессники», которых ставили на холодные звонки. Процессники выгорали от постоянного отказа.',
            actions: [
                'Разделили на хантеров (результатники) и фермеров (процессники)',
                'Изменили систему мотивации под каждый тип',
                'Процессникам дали работу с текущими клиентами и допродажи',
            ],
            after: {
                title: 'РЕЗУЛЬТАТ за 3 месяца',
                metrics: [
                    { value: '95%+', label: 'Выполнение плана' },
                    { value: '+18%', label: 'Рост выручки' },
                    { value: '0', label: 'Увольнений' },
                ],
            },
            gradient: 'from-emerald-600 to-teal-600',
        },
        {
            company: 'Производственная компания, 80 человек',
            industry: 'Производство',
            icon: '⚙️',
            before: {
                title: 'ДО диагностики',
                problems: [
                    'Проекты постоянно срывались, никто не отвечал за сроки',
                    'Отделы не взаимодействовали, каждый «сам по себе»',
                    'Хаос в процессах — каждый делал «как привык»',
                ],
            },
            diagnosis: 'Критический недостаток «Системников». Команда на 80% состояла из процессников и статусников, которые тянули одеяло на себя. Не было единой системы координации.',
            actions: [
                'Наняли 3 системных аналитиков и project-менеджеров',
                'Внедрили еженедельный ритм встреч и планирования',
                'Создали единую CRM для всех отделов',
            ],
            after: {
                title: 'РЕЗУЛЬТАТ за 4 месяца',
                metrics: [
                    { value: '90%', label: 'Проекты в срок' },
                    { value: '-30%', label: 'Снижение конфликтов' },
                    { value: '+15%', label: 'Производительность' },
                ],
            },
            gradient: 'from-purple-600 to-pink-600',
        },
    ];

    return (
        <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-bold mb-6">
                            Реальные{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                                результаты
                            </span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Как диагностика помогла компаниям решить критические проблемы с командами
                        </p>
                    </div>

                    {/* Cases */}
                    <div className="space-y-12">
                        {cases.map((caseStudy, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/20"
                            >
                                {/* Header */}
                                <div className="flex items-start gap-6 mb-8">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${caseStudy.gradient} flex items-center justify-center text-3xl flex-shrink-0 shadow-lg`}>
                                        {caseStudy.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-bold mb-2">{caseStudy.company}</h3>
                                        <p className="text-gray-400">{caseStudy.industry}</p>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="grid md:grid-cols-2 gap-8 mb-8">
                                    {/* Before */}
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                                        <h4 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                            {caseStudy.before.title}
                                        </h4>
                                        <ul className="space-y-3">
                                            {caseStudy.before.problems.map((problem, i) => (
                                                <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                                                    <span className="text-red-400 mt-1">✗</span>
                                                    <span>{problem}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* After */}
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                                        <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                            {caseStudy.after.title}
                                        </h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            {caseStudy.after.metrics.map((metric, i) => (
                                                <div key={i} className="text-center">
                                                    <div className={`text-3xl font-bold bg-gradient-to-r ${caseStudy.gradient} text-transparent bg-clip-text mb-1`}>
                                                        {metric.value}
                                                    </div>
                                                    <div className="text-xs text-gray-400">{metric.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Diagnosis */}
                                <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
                                    <h4 className="text-sm font-bold text-primary-400 mb-3 uppercase tracking-wide">
                                        Что показала диагностика
                                    </h4>
                                    <p className="text-gray-300 leading-relaxed">{caseStudy.diagnosis}</p>
                                </div>

                                {/* Actions */}
                                <div>
                                    <h4 className="text-sm font-bold text-accent-400 mb-4 uppercase tracking-wide">
                                        Управленческие решения
                                    </h4>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {caseStudy.actions.map((action, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                                                <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${caseStudy.gradient} flex items-center justify-center text-xs font-bold`}>
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm text-gray-300">{action}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-16 text-center">
                        <p className="text-xl text-gray-300 mb-6">
                            Хотите понять, что покажет диагностика по вашей команде?
                        </p>
                        <a
                            href="#mini-quiz"
                            className="inline-block px-10 py-5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105"
                        >
                            Пройти экспресс-диагностику
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
