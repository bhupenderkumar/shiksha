import Layout from '../components/Layout';
import { useAuth } from '../lib/auth-provider';
import '../styles/globals.css';
import { PWAPrompt } from "@/components/ui/pwa-prompt";
import { Toaster } from "react-hot-toast";

function App({ Component, pageProps }: any) {
  const { profile } = useAuth();

  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <PWAPrompt />
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
