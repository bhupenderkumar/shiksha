interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute w-full h-full border-4 border-primary-200 rounded-full animate-spin" />
        <div className="absolute w-full h-full border-4 border-primary-500 rounded-full animate-spin-slow opacity-75" style={{ animationDirection: 'reverse' }} />
        <div className="absolute w-full h-full border-4 border-transparent border-t-secondary-500 rounded-full animate-bounce opacity-50" />
      </div>
      <style jsx>{`
        @keyframes spin-slow {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
} 