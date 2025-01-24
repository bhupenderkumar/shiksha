import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star, User, Calendar } from 'lucide-react';

export interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
}

export interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{review.author}</h4>
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(review.date).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>
          
          <div className="flex mb-4">{renderStars(review.rating)}</div>
          
          <p className="text-muted-foreground line-clamp-4">{review.content}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
