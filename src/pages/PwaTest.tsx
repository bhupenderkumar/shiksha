import { useEffect } from 'react';
import { PWAPrompt } from '@/components/ui/pwa-prompt';
import { InstallPWAButton } from '@/components/ui/install-pwa-button';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function PwaTest() {
  useEffect(() => {
    // Log PWA status
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    console.log('Running in standalone mode:', isStandalone);
    
    // Check service worker support
    if ('serviceWorker' in navigator) {
      console.log('Service Worker is supported');
      
      // Check service worker registration
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('Service Worker registrations:', registrations);
      });
    } else {
      console.log('Service Worker is NOT supported');
    }
    
    // Check manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    console.log('Manifest link found:', !!manifestLink);
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired');
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">PWA Installation Test Page</h1>
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="grid gap-8">
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">PWA Status</h2>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span>Running as PWA:</span>
                <span className="font-mono" id="pwa-status">
                  {window.matchMedia('(display-mode: standalone)').matches ? 'Yes ✅' : 'No ❌'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span>Service Worker Support:</span>
                <span className="font-mono">
                  {'serviceWorker' in navigator ? 'Yes ✅' : 'No ❌'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span>Manifest Link:</span>
                <span className="font-mono">
                  {document.querySelector('link[rel="manifest"]') ? 'Found ✅' : 'Missing ❌'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">Installation Options</h2>
            <div className="grid gap-4">
              <div className="p-4 border rounded bg-muted/50">
                <h3 className="font-medium mb-2">Standard Install Button</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This button will only appear if the PWA is installable and not already installed.
                </p>
                <div className="w-full max-w-xs">
                  <InstallPWAButton />
                </div>
              </div>
              
              <div className="p-4 border rounded bg-muted/50">
                <h3 className="font-medium mb-2">PWA Prompt</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This component shows a custom installation prompt. On localhost, it will force display
                  a test version after a short delay.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => localStorage.removeItem('pwa-prompt-dismissed')}
                >
                  Reset Prompt Dismissal
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Make sure you're using a supported browser (Chrome, Edge, Firefox, etc.)</li>
              <li>The site must be served over HTTPS (except on localhost)</li>
              <li>The PWA must have a valid manifest.json file</li>
              <li>The PWA must have a registered service worker</li>
              <li>On iOS, use "Add to Home Screen" from the share menu in Safari</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* PWA Prompt will appear automatically */}
      <PWAPrompt />
    </div>
  );
}