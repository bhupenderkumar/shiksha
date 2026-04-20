import { useNetwork } from '@/contexts/NetworkContext';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-[60] bg-amber-500 text-white text-center text-sm py-1.5 px-4 flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>You&apos;re offline — showing cached data</span>
    </div>
  );
}
