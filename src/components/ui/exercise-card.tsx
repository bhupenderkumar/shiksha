import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlayButton } from '@/components/ui/play-button';
import { Badge } from '@/components/ui/badge';

interface ExerciseCardProps {
  title: string;
  description?: string;
  playUrl: string;
  children: ReactNode;
  tags?: string[];
  className?: string;
}

export function ExerciseCard({
  title,
  description,
  playUrl,
  children,
  tags = [],
  className = ''
}: ExerciseCardProps) {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${className}`}>
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
          <PlayButton 
            url={playUrl} 
            variant="outline"
            className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {children}
      </CardContent>
      
      {tags.length > 0 && (
        <CardFooter className="flex flex-wrap gap-2 border-t bg-gray-50 py-3 px-4">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
              {tag}
            </Badge>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}

export default ExerciseCard;
