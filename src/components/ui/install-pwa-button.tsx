import { useState, useEffect } from 'react';
import { Button } from './button';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstallable(!isInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.error('Installation not supported in this browser');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('Thank you for installing our app!');
        setIsInstallable(false);
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      toast.error('Failed to install app');
    } finally {
      setDeferredPrompt(null);
    }
  };

  if (!isInstallable) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start"
      onClick={handleInstall}
    >
      <Download className="mr-2 h-4 w-4" />
      Install App
    </Button>
  );
}
