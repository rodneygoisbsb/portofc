import React from 'react';

type ButtonVariant = 'primary' | 'emerald' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-xl font-medium gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl font-medium gap-2',
    lg: 'px-5 py-2.5 text-base rounded-xl font-semibold gap-2.5',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm shadow-blue-700/20 active:scale-[0.98]',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 active:scale-[0.98]',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98]',
    ghost: 'text-slate-600 hover:bg-slate-100/80 active:scale-[0.98]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
