import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { Button } from './button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // Force show for testing on localhost
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isInstalled) {
      return; // Don't show prompt if already installed
    }

    // Check if user has previously dismissed the prompt
    const hasUserDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (hasUserDismissed && !forceShow) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For testing on localhost, show a button after 2 seconds
    const timer = setTimeout(() => {
      if (window.location.hostname === 'localhost') {
        console.log('Running on localhost - enabling force show option');
        setForceShow(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('No installation prompt available');
      alert('Installation prompt not available. This may be because:\n- The app is already installed\n- Your browser doesn\'t support PWA installation\n- You\'re using an iOS device (use "Add to Home Screen" in Safari)');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        console.log('PWA installation accepted');
      } else {
        console.log('PWA installation dismissed');
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Store dismissal in localStorage
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Force show the prompt for testing on localhost
  if (forceShow) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[400px] bg-card p-4 rounded-lg shadow-lg border border-border z-50"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-4">
            <h3 className="font-semibold text-lg mb-1">Install Shiksha App (Test Mode)</h3>
            <p className="text-muted-foreground text-sm">
              This is a test installation prompt for localhost development.
            </p>
          </div>
          <button
            onClick={() => setForceShow(false)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Dismiss prompt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 flex gap-3">
          <Button
            variant="default"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleInstall}
          >
            <Download className="mr-2 h-4 w-4" />
            Test Install Now
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setForceShow(false)}
          >
            Close
          </Button>
        </div>
      </motion.div>
    );
  }

  if (!showPrompt || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[400px] bg-card p-4 rounded-lg shadow-lg border border-border z-50"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-4">
            <h3 className="font-semibold text-lg mb-1">Install Shiksha App</h3>
            <p className="text-muted-foreground text-sm">
              Install our app for a better experience with offline access and quick loading!
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Dismiss prompt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 flex gap-3">
          <Button
            variant="default"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleInstall}
          >
            <Download className="mr-2 h-4 w-4" />
            Install Now
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDismiss}
          >
            Maybe Later
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
