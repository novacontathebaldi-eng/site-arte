import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'border-brand-black' }) => {
  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${color}`} role="status">
        <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;