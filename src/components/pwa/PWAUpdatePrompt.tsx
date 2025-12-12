import React, { useState, useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { X, RefreshCw, Download } from 'lucide-react';

export const PWAUpdatePrompt: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateSW, setUpdateSW] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    const sw = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
        // Auto-hide offline ready message after 4 seconds
        setTimeout(() => setOfflineReady(false), 4000);
      },
      onRegistered(r) {
        console.log('Service Worker registered:', r);
      },
      onRegisterError(error) {
        console.error('Service Worker registration error:', error);
      }
    });
    setUpdateSW(() => sw);
  }, []);

  const handleUpdate = () => {
    if (updateSW) {
      updateSW(true);
    }
  };

  const handleClose = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  if (!needRefresh && !offlineReady) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] flex justify-center pointer-events-none">
      <div className="pointer-events-auto max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
        {needRefresh && (
          <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-xl shadow-2xl p-4 border border-white/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-indigo-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-white drop-shadow-sm">Update Available</h3>
                <p className="text-sm text-white/90 mt-1">
                  A new version of Shiksha is ready. Update now for the latest features!
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors text-sm shadow-md"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Update Now
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-white font-medium hover:bg-white/20 rounded-lg transition-colors text-sm border border-white/30"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {offlineReady && !needRefresh && (
          <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-xl shadow-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white drop-shadow-sm">Ready to Work Offline</h3>
                <p className="text-sm text-white/90 mt-1">
                  Shiksha is now installed and available offline!
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
