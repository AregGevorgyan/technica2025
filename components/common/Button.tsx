import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
  primary: `
    bg-[var(--foreground)] 
    text-[var(--background)]
    hover:opacity-90 
    focus:ring-[var(--foreground)]
  `,
  secondary: `
    bg-[var(--background)] 
    text-[var(--foreground)]
    hover:opacity-90 
    focus:ring-[var(--foreground)]
  `,
  outline: `
    border-2 border-[var(--foreground)] 
    text-[var(--foreground)] 
    hover:bg-[var(--foreground)] hover:text-[var(--background)]
    focus:ring-[var(--foreground)]
  `,
  danger: `
    bg-red-600 hover:bg-red-700 text-white focus:ring-red-500
  `,
};

  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
