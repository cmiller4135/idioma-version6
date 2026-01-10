import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700 border-primary-200',
  secondary: 'bg-accent-100 text-accent-800 border-accent-200',
  success: 'bg-success-100 text-success-700 border-success-200',
  warning: 'bg-warning-100 text-warning-700 border-warning-200',
  error: 'bg-error-100 text-error-700 border-error-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500',
  secondary: 'bg-accent-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  gray: 'bg-gray-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

// Number badge (for notifications, counts)
export interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeVariant;
  className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  variant = 'error',
  className = '',
}) => {
  const displayCount = count > max ? `${max}+` : count.toString();

  if (count <= 0) return null;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[20px] h-5 px-1.5
        text-xs font-bold rounded-full
        ${variant === 'error' ? 'bg-error-500 text-white' : variantStyles[variant]}
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
};

// Status indicator badge
export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  label?: string;
  className?: string;
}

const statusStyles = {
  online: { color: 'bg-success-500', label: 'Online' },
  offline: { color: 'bg-gray-400', label: 'Offline' },
  busy: { color: 'bg-error-500', label: 'Busy' },
  away: { color: 'bg-warning-500', label: 'Away' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
}) => {
  const config = statusStyles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm text-gray-600 ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${config.color}`}
        aria-hidden="true"
      />
      {label || config.label}
    </span>
  );
};

export default Badge;
