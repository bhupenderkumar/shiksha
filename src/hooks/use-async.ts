import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useAsync<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T,
  options: UseAsyncOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      try {
        setLoading(true);
        setError(null);
        const data = await asyncFunction(...args);
        options.onSuccess?.(data);
        if (options.showSuccessToast) {
          toast.success('Operation completed successfully');
        }
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);
        options.onError?.(error);
        if (options.showErrorToast) {
          toast.error(error.message);
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, options]
  );

  return {
    loading,
    error,
    execute,
  };
} 