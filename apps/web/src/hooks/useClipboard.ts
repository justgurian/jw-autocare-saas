import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook for copying text to clipboard with visual feedback.
 * Returns [copied, copyToClipboard] where copied resets after 2s.
 */
export function useClipboard(successMessage = 'Copied!') {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    },
    [successMessage]
  );

  return [copied, copyToClipboard] as const;
}
