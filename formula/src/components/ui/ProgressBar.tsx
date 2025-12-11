import React from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
    showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    current,
    total,
    showText = true,
}) => {
    const percentage = Math.round((current / total) * 100);

    return (
        <div className="w-full">
            {showText && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        Вопрос {current} из {total}
                    </span>
                    <span className="text-sm text-gray-500">{percentage}%</span>
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-primary-600 to-primary-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    );
};
