import { BookOpen } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <BookOpen className="w-8 h-8 text-primary-500 animate-float" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-400 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-display text-primary-600 leading-none">
          First Step
        </span>
        <span className="text-sm font-handwriting text-gray-500 leading-none">
          Public School
        </span>
      </div>
    </div>
  );
}
