import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                id={inputId}
                className={`
          w-full px-4 py-3 rounded-lg border
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'}
          focus:outline-none focus:ring-2 focus:border-transparent
          transition-all duration-200
          ${className}
        `}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                {...props}
            />
            {error && (
                <p id={`${inputId}-error`} className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p id={`${inputId}-helper`} className="mt-2 text-sm text-gray-500">
                    {helperText}
                </p>
            )}
        </div>
    );
};
