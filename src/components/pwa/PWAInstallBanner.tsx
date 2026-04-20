import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('pwa-banner-dismissed')) {
      setDismissed(true);
      return;
    }

    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDismissed(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa-banner-dismissed', '1');
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 p-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white safe-area-bottom md:bottom-0 md:hidden">
      <div className="flex items-center gap-3">
        <Download className="w-6 h-6 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Install First Step School</p>
          <p className="text-xs text-white/80">Add to your home screen for quick access</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 px-4 py-2 bg-white text-violet-700 text-sm font-semibold rounded-lg"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 hover:bg-white/20 rounded-full"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
