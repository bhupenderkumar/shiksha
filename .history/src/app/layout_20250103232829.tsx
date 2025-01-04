import { ThemeProvider } from 'next-themes';

// ...existing code...
return (
  <html lang="en" suppressHydrationWarning>
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
