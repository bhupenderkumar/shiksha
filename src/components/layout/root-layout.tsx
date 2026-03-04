import { Toaster } from "@/components/ui/toast";

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
