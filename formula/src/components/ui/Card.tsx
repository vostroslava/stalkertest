import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    onClick,
}) => {
    return (
        <div
            className={`
        bg-white rounded-xl shadow-lg p-6
        ${hover ? 'transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer' : ''}
        ${className}
      `}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
};
