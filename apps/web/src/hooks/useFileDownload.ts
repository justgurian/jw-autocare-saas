import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { downloadApi } from '../services/api';

/**
 * Hook for downloading generated content as a file.
 * Handles blob creation, download trigger, and cleanup.
 */
export function useFileDownload() {
  const download = useCallback(async (contentId: string, filename: string) => {
    try {
      const response = await downloadApi.downloadSingle(contentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download');
    }
  }, []);

  return download;
}
