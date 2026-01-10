import React from 'react';

export type ProgressVariant = 'primary' | 'success' | 'warning' | 'error' | 'accent';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside' | 'top';
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

const variantStyles: Record<ProgressVariant, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  accent: 'bg-accent-500',
};

const trackStyles: Record<ProgressVariant, string> = {
  primary: 'bg-primary-100',
  success: 'bg-success-100',
  warning: 'bg-warning-100',
  error: 'bg-error-100',
  accent: 'bg-accent-100',
};

const sizeStyles: Record<ProgressSize, string> = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  labelPosition = 'outside',
  label,
  animated = false,
  striped = false,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label || `${Math.round(percentage)}%`;

  const stripedClass = striped
    ? 'bg-[length:1rem_1rem] bg-gradient-to-r from-transparent via-white/20 to-transparent'
    : '';

  const animatedClass = animated && striped
    ? 'animate-[progress-stripes_1s_linear_infinite]'
    : '';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && labelPosition === 'top' && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{displayLabel}</span>
          <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className={`
            flex-1 rounded-full overflow-hidden
            ${trackStyles[variant]}
            ${sizeStyles[size]}
          `}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={displayLabel}
        >
          <div
            className={`
              h-full rounded-full transition-all duration-500 ease-out
              ${variantStyles[variant]}
              ${stripedClass}
              ${animatedClass}
            `}
            style={{ width: `${percentage}%` }}
          >
            {showLabel && labelPosition === 'inside' && size !== 'xs' && size !== 'sm' && (
              <span className="flex items-center justify-center h-full text-xs font-medium text-white">
                {percentage >= 10 ? displayLabel : ''}
              </span>
            )}
          </div>
        </div>

        {showLabel && labelPosition === 'outside' && (
          <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
            {displayLabel}
          </span>
        )}
      </div>
    </div>
  );
};

// Circular progress variant
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  variant = 'primary',
  showLabel = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variantColors: Record<ProgressVariant, string> = {
    primary: '#264653',
    success: '#22c55e',
    warning: '#F4A261',
    error: '#E63946',
    accent: '#E9C46A',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={variantColors[variant]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold text-gray-700">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

// Steps progress indicator
export interface StepsProgressProps {
  steps: string[];
  currentStep: number;
  variant?: ProgressVariant;
  className?: string;
}

export const StepsProgress: React.FC<StepsProgressProps> = ({
  steps,
  currentStep,
  variant = 'primary',
  className = '',
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  transition-colors duration-200
                  ${
                    isCompleted
                      ? `${variantStyles[variant]} text-white`
                      : isCurrent
                      ? `border-2 ${variant === 'primary' ? 'border-primary-500 text-primary-600' : `border-${variant}-500 text-${variant}-600`}`
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4\" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium text-center max-w-[80px]
                  ${isCurrent ? 'text-primary-600' : 'text-gray-500'}
                `}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2
                  ${isCompleted ? variantStyles[variant] : 'bg-gray-200'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressBar;
