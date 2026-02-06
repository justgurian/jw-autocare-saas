import { useState, useCallback, useRef, useEffect } from 'react';
import { videoCreatorApi } from '../services/api';

interface VideoJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  contentId?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

interface UsePollJobOptions {
  intervalMs?: number;
  maxPollTimeMs?: number;
  onComplete?: (job: VideoJob) => void;
  onFailed?: (job: VideoJob) => void;
  onTimeout?: () => void;
}

export function usePollJob(options: UsePollJobOptions = {}) {
  const {
    intervalMs = 5000,
    maxPollTimeMs = 360000,
    onComplete,
    onFailed,
    onTimeout,
  } = options;

  const [job, setJob] = useState<VideoJob | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onFailedRef = useRef(onFailed);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onFailedRef.current = onFailed; }, [onFailed]);
  useEffect(() => { onTimeoutRef.current = onTimeout; }, [onTimeout]);

  const stopPolling = useCallback(() => {
    abortRef.current?.abort();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    abortRef.current = null;
    timeoutRef.current = null;
    intervalRef.current = null;
    setIsPolling(false);
  }, []);

  const startPolling = useCallback((jobId: string) => {
    stopPolling();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsPolling(true);
    setJob({ id: jobId, status: 'pending', progress: 5 });

    timeoutRef.current = setTimeout(() => {
      stopPolling();
      onTimeoutRef.current?.();
    }, maxPollTimeMs);

    const poll = async () => {
      if (controller.signal.aborted) return;
      try {
        const response = await videoCreatorApi.getJob(jobId);
        const data = response.data?.data || response.data;
        const jobData: VideoJob = {
          id: jobId,
          status: data.status,
          progress: data.progress || 0,
          videoUrl: data.videoUrl || data.metadata?.videoUrl,
          thumbnailUrl: data.thumbnailUrl || data.metadata?.thumbnailUrl,
          caption: data.caption || data.metadata?.caption,
          contentId: data.contentId || data.metadata?.contentId,
          error: data.error || data.metadata?.error,
          metadata: data.metadata,
        };
        if (!controller.signal.aborted) {
          setJob(jobData);
          if (jobData.status === 'completed') {
            stopPolling();
            onCompleteRef.current?.(jobData);
          } else if (jobData.status === 'failed') {
            stopPolling();
            onFailedRef.current?.(jobData);
          }
        }
      } catch {
        // Continue polling on network errors
      }
    };

    poll();
    intervalRef.current = setInterval(poll, intervalMs);
  }, [stopPolling, intervalMs, maxPollTimeMs]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  return { job, isPolling, startPolling, stopPolling };
}
