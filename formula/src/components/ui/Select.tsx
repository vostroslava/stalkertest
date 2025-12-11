import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    options,
    className = '',
    id,
    ...props
}) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <select
                id={selectId}
                className={`
          w-full px-4 py-3 rounded-lg border
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'}
          focus:outline-none focus:ring-2 focus:border-transparent
          transition-all duration-200 bg-white
          ${className}
        `}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${selectId}-error` : undefined}
                {...props}
            >
                <option value="">Выберите...</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p id={`${selectId}-error`} className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};
