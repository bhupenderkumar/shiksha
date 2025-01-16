import React from 'react';
import { cn } from '@/lib/utils';
import { FrownIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  if (!title) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg',
        'bg-gradient-to-b from-white to-gray-50',
        'border-2 border-dashed border-gray-200',
        'dark:from-gray-900 dark:to-gray-800 dark:border-gray-700',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="relative"
      >
        {icon || (
          <div className="w-16 h-16 mb-4 text-gray-400 flex items-center justify-center">
            <FrownIcon className="w-full h-full" />
          </div>
        )}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-lg animate-pulse" />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.2 }}
        className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
      >
        {title === 'No Students Available' ? (
          <div className="empty-state">
            <h2>No Students Available</h2>
            <p>Please check back later.</p>
          </div>
        ) : (
          title
        )}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.2 }}
        className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4"
      >
        {description}
      </motion.p>
      
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.2 }}
          className="mt-2"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};