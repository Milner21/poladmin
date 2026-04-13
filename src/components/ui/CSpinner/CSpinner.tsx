import type { FC } from 'react';

interface CSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeClasses = {
  small: 'w-4 h-4 border-2',
  medium: 'w-8 h-8 border-2',
  large: 'w-12 h-12 border-3',
};

export const CSpinner: FC<CSpinnerProps> = ({ 
  size = 'medium',
  className = '',
}) => {
  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-primary
        border-t-transparent
        rounded-full
        animate-spin
        ${className}
      `}
      role="status"
      aria-label="Cargando"
    />
  );
};