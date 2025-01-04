import { ThemeProvider } from 'next-themes';

// ...existing code...
return (
  <html lang="en" suppressHydrationWarning>
    <body>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </body>
  </html>
);
// ...existing code...
