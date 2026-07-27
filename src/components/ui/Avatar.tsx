import React from 'react';

interface AvatarProps {
    src?: string | null;
    name?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    name = 'User',
    size = 'md',
    className = '',
}) => {
    const sizeClasses = {
        sm: 'w-7 h-7 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
    };

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`${sizeClasses[size]} rounded-full object-cover border border-gray-200 ${className}`}
            />
        );
    }

    return (
        <div
            className={`${sizeClasses[size]} rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white font-bold flex items-center justify-center shadow-xs ${className}`}
            title={name}
        >
            {initials}
        </div>
    );
};
