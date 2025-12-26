import { Toaster as RadToaster, toast } from 'react-hot-toast';

export function Toaster() {
  return (
    <RadToaster
      position="top-right"
      toastOptions={{
        // Default styles for all toasts
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '0.5rem',
          padding: '12px 16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        // Success toast styles
        success: {
          duration: 3000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(142.1 76.2% 36.3%)',
          },
          iconTheme: {
            primary: 'hsl(142.1 76.2% 36.3%)',
            secondary: 'white',
          },
        },
        // Error toast styles
        error: {
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--destructive))',
          },
          iconTheme: {
            primary: 'hsl(var(--destructive))',
            secondary: 'white',
          },
        },
        // Loading toast styles
        loading: {
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--primary))',
          },
        },
      }}
    />
  );
}

export { toast };