import React from 'react';
import type { EmployeeTestQuestion as QuestionType } from '@/lib/employee-profiles';

interface EmployeeTestQuestionProps {
    question: QuestionType;
    questionNumber: number;
    totalQuestions: number;
    onAnswer: (option: 'A' | 'B' | 'C') => void;
}

export const EmployeeTestQuestion: React.FC<EmployeeTestQuestionProps> = ({
    question,
    questionNumber,
    totalQuestions,
    onAnswer,
}) => {
    return (
        <div className="space-y-8">
            {/* Progress indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/70">
                        Вопрос {questionNumber} из {totalQuestions}
                    </span>
                    <span className="text-sm font-medium text-white/70">
                        {Math.round((questionNumber / totalQuestions) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-primary-400 to-accent-400 h-full transition-all duration-500 ease-out"
                        style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question text */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                    {question.text}
                </h3>
            </div>

            {/* Options */}
            <div className="space-y-4">
                {question.options.map((option) => (
                    <button
                        key={option.variant}
                        onClick={() => onAnswer(option.variant)}
                        className="w-full text-left p-6 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-primary-400/50 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                                {option.variant}
                            </div>
                            <p className="flex-1 text-base md:text-lg text-white/90 leading-relaxed pt-1">
                                {option.text}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Helper text */}
            <p className="text-center text-sm text-white/50 mt-6">
                Выберите вариант, который лучше всего описывает поведение сотрудника
            </p>
        </div>
    );
};
