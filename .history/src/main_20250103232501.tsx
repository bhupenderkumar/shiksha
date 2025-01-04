import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from './components/providers/theme-provider';
import App from './App';
import './styles/globals.css';

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <AuthProvider>
          <App />
        </AuthProvider>   
      </ThemeProvider>
    </React.StrictMode>
  );
}
