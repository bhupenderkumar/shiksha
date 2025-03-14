import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './components/providers/theme-provider';
import { AuthProvider } from './lib/auth';
import App from './App';
import './styles/globals.css';

// GTM Script Component
const GTMScript: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-MRQ2QLPL';
    document.head.appendChild(script);

    const gtmDataLayer = document.createElement('script');
    gtmDataLayer.innerHTML = "window.dataLayer = window.dataLayer || []; window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});";
    document.head.appendChild(gtmDataLayer);

    const noscriptTag = document.createElement('noscript');
    noscriptTag.innerHTML = '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MRQ2QLPL" height="0" width="0" style="display:none;visibility:hidden"></iframe>';
    document.body.insertBefore(noscriptTag, document.body.firstChild);
  }, []);

  return null;
}

// Service Worker Registration for PWA
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
};

// Register the service worker
registerServiceWorker();

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <AuthProvider>
          <GTMScript />
          <App />
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
