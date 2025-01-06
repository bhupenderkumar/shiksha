import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function AnimatedCard({ title, className, children, onClick }: AnimatedCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {title && (
        <CardHeader>
          <CardTitle className="font-display text-primary-600">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
} 