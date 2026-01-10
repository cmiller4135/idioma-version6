import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'primary' | 'white' | 'accent' | 'gray';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3 border-[2px]',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
};

const colorStyles: Record<SpinnerColor, string> = {
  primary: 'border-primary-200 border-t-primary-600',
  white: 'border-white/30 border-t-white',
  accent: 'border-accent-200 border-t-accent-600',
  gray: 'border-gray-200 border-t-gray-600',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  label,
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="status">
      <div
        className={`
          ${sizeStyles[size]}
          ${colorStyles[color]}
          rounded-full animate-spin
        `}
        aria-hidden="true"
      />
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
};

// Full-page loading spinner
export interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
      <Spinner size="xl" color="primary" />
      <p className="text-lg font-medium text-primary-700">{message}</p>
    </div>
  );
};

// Inline loading indicator
export interface InlineLoaderProps {
  text?: string;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
  text = 'Loading...',
}) => {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Spinner size="sm" color="primary" />
      <span className="text-sm text-gray-500">{text}</span>
    </div>
  );
};

export default Spinner;
