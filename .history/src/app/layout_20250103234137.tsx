import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';

const clearCache = () => {
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
};

useEffect(() => {
  clearCache();
}, []);

const version = '1.0.0'; // Update this version whenever you make changes

return (
  <html lang="en" suppressHydrationWarning>
    <head>
      <link rel="stylesheet" href={`/path/to/your/styles.css?v=${version}`} />
      <script src={`/path/to/your/script.js?v=${version}`} defer></script>
    </head>
    <body className="min-h-screen bg-background">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="relative flex min-h-screen flex-col">  
          <Header />
          <div className="flex-1 container max-w-screen-2xl mx-auto px-4 py-6 md:px-8 lg:px-12">
            {children}
          </div> 
        </div>
      </ThemeProvider>
    </body>
  </html>
);
// ...existing code...
