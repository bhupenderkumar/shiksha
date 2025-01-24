import { BrowserRouter as Router } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';
import '../styles/globals.css';
import { ThemeProvider } from "@/components/theme-provider";
import { PWAPrompt } from "@/components/ui/pwa-prompt";
import { Toaster } from "react-hot-toast";

function App({ Component, pageProps }: any) {
  const { profile } = useAuth();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Router>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <PWAPrompt />
        <Toaster position="bottom-right" />
      </Router>
    </ThemeProvider>
  );
}

export default App;
