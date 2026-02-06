import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-retro-mustard border-b-2 border-black px-4 py-2 flex items-center justify-center gap-3" role="alert">
      <WifiOff size={16} className="flex-shrink-0" />
      <span className="text-sm font-heading">You are offline. Some features may not work until you reconnect.</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 p-1 hover:bg-black/10 rounded"
        aria-label="Dismiss offline warning"
      >
        <X size={14} />
      </button>
    </div>
  );
}
