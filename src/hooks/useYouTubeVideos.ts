import { useState, useEffect } from 'react';
import type { Video } from '@/types/home';

interface UseYouTubeVideosReturn {
  videos: Video[];
  isLoading: boolean;
  error: Error | null;
}

export function useYouTubeVideos(): UseYouTubeVideosReturn {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
        const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

        if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
          throw new Error('YouTube API key or Channel ID not configured');
        }

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=5&type=video`
        );

        if (!response.ok) {
          throw new Error(`YouTube API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        setVideos(data.items.map((item: any) => ({
          id: { videoId: item.id.videoId },
          snippet: { title: item.snippet.title }
        })));
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to fetch videos'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchVideos();
  }, []);

  return { videos, isLoading, error };
}