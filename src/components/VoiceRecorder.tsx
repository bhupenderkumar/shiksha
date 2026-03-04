import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onRecordingDelete?: () => void;
  maxDurationSeconds?: number;
  className?: string;
}

export function VoiceRecorder({
  onRecordingComplete,
  onRecordingDelete,
  maxDurationSeconds = 120,
  className,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [recordedUrl]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        onRecordingComplete(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);

      // Timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev + 1 >= maxDurationSeconds) {
            stopRecording();
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Mic access error:', err);
      setError('माइक की अनुमति दें / Allow microphone access');
    }
  }, [maxDurationSeconds, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const deleteRecording = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setDuration(0);
    setIsPlaying(false);
    onRecordingDelete?.();
  }, [recordedUrl, onRecordingDelete]);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current || !recordedUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = recordedUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, recordedUrl]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      {/* Recording state */}
      {!recordedBlob && (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95',
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
            )}
          >
            {isRecording ? (
              <Square className="w-10 h-10 text-white" fill="white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>

          {isRecording ? (
            <div className="text-center">
              <p className="text-red-500 font-bold text-lg">{formatTime(duration)}</p>
              <p className="text-sm text-gray-500">
                🔴 रिकॉर्डिंग... / Recording...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                रोकने के लिए दबाएं / Tap to stop
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">
                🎤 बोलने के लिए दबाएं
              </p>
              <p className="text-xs text-gray-400">Tap to record</p>
            </div>
          )}
        </div>
      )}

      {/* Recorded state */}
      {recordedBlob && (
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 w-full max-w-xs">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-0.5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800">
                ✅ रिकॉर्ड हो गया
              </p>
              <p className="text-xs text-green-600">
                Recorded • {formatTime(duration)}
              </p>
            </div>
            <button
              type="button"
              onClick={deleteRecording}
              className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
          <button
            type="button"
            onClick={deleteRecording}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            दोबारा रिकॉर्ड करें / Re-record
          </button>
        </div>
      )}
    </div>
  );
}
