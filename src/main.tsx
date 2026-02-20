import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { ClassAuthProvider } from './lib/class-auth-provider';
import { PWAUpdatePrompt } from './components/pwa/PWAUpdatePrompt';
import App from './App';
import './styles/globals.css';
import { logVersionInfo } from './lib/version';

// Log version on startup
logVersionInfo();

// GTM Script Component
const GTMScript: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    const gtmId = import.meta.env.VITE_GTM_ID || '';
    if (!gtmId) return;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(script);

    const gtmDataLayer = document.createElement('script');
    gtmDataLayer.innerHTML = "window.dataLayer = window.dataLayer || []; window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});";
    document.head.appendChild(gtmDataLayer);

    const noscriptTag = document.createElement('noscript');
    noscriptTag.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscriptTag, document.body.firstChild);
  }, []);

  return null;
}

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <ClassAuthProvider>
          <Router>
            <GTMScript />
            <App />
            <PWAUpdatePrompt />
          </Router>
        </ClassAuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
