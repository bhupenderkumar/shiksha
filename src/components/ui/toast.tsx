import { Toaster as RadToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <RadToaster
      position="top-center"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
        success: {
          duration: 3000,
        },
        error: {
          duration: 4000,
        },
      }}
    />
  );
}

export { toast } from 'react-hot-toast';