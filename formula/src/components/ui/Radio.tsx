import React from 'react';

interface RadioGroupProps {
    label?: string;
    name: string;
    options: { value: string; label: string; description?: string }[];
    value?: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
    label,
    name,
    options,
    value,
    onChange,
    error,
    required,
}) => {
    return (
        <div className="w-full">
            {label && (
                <legend className="block text-sm font-medium text-gray-700 mb-3">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </legend>
            )}
            <div className="space-y-3">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={`
              flex items-start p-4 rounded-lg border-2 cursor-pointer
              transition-all duration-200
              ${value === option.value
                                ? 'border-primary-600 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                            }
            `}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={(e) => onChange(e.target.value)}
                            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">
                                {option.label}
                            </span>
                            {option.description && (
                                <span className="block text-sm text-gray-500 mt-1">
                                    {option.description}
                                </span>
                            )}
                        </div>
                    </label>
                ))}
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
