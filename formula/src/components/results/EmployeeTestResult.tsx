import React from 'react';
import type { EmployeeTestResult as ResultType } from '@/lib/employee-profiles';
import { EMPLOYEE_PROFILES } from '@/lib/employee-profiles';

interface EmployeeTestResultProps {
    result: ResultType;
    employeeName: string;
    onAssessAnother: () => void;
    onOpenConsultation: () => void;
}

export const EmployeeTestResult: React.FC<EmployeeTestResultProps> = ({
    result,
    employeeName,
    onAssessAnother,
    onOpenConsultation,
}) => {
    const profile = EMPLOYEE_PROFILES[result.profileType];

    // Profile icon based on type
    const profileIcons = {
        resultnik: '🎯',
        processnik: '⚙️',
        statusnik: '👑',
    };

    // Profile colors
    const profileColors = {
        resultnik: 'from-emerald-500 to-teal-500',
        processnik: 'from-blue-500 to-cyan-500',
        statusnik: 'from-purple-500 to-pink-500',
    };

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br ${profileColors[result.profileType]} rounded-3xl text-5xl mb-6 shadow-2xl transform hover:rotate-12 transition-transform duration-500`}>
                    {profileIcons[result.profileType]}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    {employeeName && <span className="text-white/70">{employeeName} — </span>}
                    {profile.title}
                </h3>
                <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                    {profile.description}
                </p>
            </div>

            {/* Scores visualization */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-bold text-white mb-4">Распределение баллов:</h4>
                <div className="space-y-3">
                    {Object.entries(result.scores).map(([key, value]) => {
                        const label = key === 'resultnik' ? 'Результатник' : key === 'processnik' ? 'Процессник' : 'Статусник';
                        const isMax = value === Math.max(...Object.values(result.scores));
                        return (
                            <div key={key}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-sm font-medium ${isMax ? 'text-primary-300' : 'text-white/70'}`}>
                                        {label}
                                    </span>
                                    <span className={`text-sm font-bold ${isMax ? 'text-primary-300' : 'text-white/70'}`}>
                                        {value} из 7
                                    </span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${isMax ? 'bg-gradient-to-r from-primary-400 to-accent-400' : 'bg-white/30'
                                            }`}
                                        style={{ width: `${(value / 7) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10">
                <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-3xl">💡</span>
                    Как управлять таким сотрудником
                </h4>
                <ul className="space-y-4">
                    {profile.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {index + 1}
                            </span>
                            <p className="flex-1 text-base text-white/90 leading-relaxed pt-1">{rec}</p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                    onClick={onAssessAnother}
                    className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                    Оценить ещё одного сотрудника
                </button>
                <button
                    onClick={onOpenConsultation}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-primary-500 via-accent-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105"
                >
                    Записаться на разбор команды
                </button>
            </div>

            {/* Additional info */}
            <div className="bg-primary-500/10 backdrop-blur-sm border border-primary-400/30 rounded-xl p-4 text-center">
                <p className="text-sm text-white/80">
                    <span className="font-semibold text-primary-300">Хотите комплексный анализ всей команды?</span>
                    <br />
                    Запишитесь на бизнес-встречу, где мы разберём типы всех сотрудников и создадим план развития
                </p>
            </div>
        </div>
    );
};
