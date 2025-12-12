import { useState, useEffect } from 'react';
import type { Video } from '@/types/home';

// Sample videos to display when YouTube API is not configured
const SAMPLE_VIDEOS: Video[] = [
  {
    id: { videoId: 'dQw4w9WgXcQ' },
    snippet: { title: 'School Annual Day Celebrations 2024' }
  },
  {
    id: { videoId: 'jNQXAC9IVRw' },
    snippet: { title: 'Sports Day Highlights 2024' }
  },
  {
    id: { videoId: '9bZkp7q19f0' },
    snippet: { title: 'Academic Achievements & Award Ceremony' }
  },
  {
    id: { videoId: 'kJQP7kiw5Fk' },
    snippet: { title: 'Cultural Festival 2024' }
  },
  {
    id: { videoId: 'RgKAFK5djSk' },
    snippet: { title: 'Science Exhibition Highlights' }
  }
];

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

        // If API keys are not configured, use sample videos
        if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
          console.info('YouTube API not configured, using sample videos');
          setVideos(SAMPLE_VIDEOS);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=5&type=video`
        );

        if (!response.ok) {
          console.warn('YouTube API request failed, using sample videos');
          setVideos(SAMPLE_VIDEOS);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        const fetchedVideos = data.items?.map((item: any) => ({
          id: { videoId: item.id.videoId },
          snippet: { title: item.snippet.title }
        })) || [];
        
        // If no videos fetched, use sample videos
        setVideos(fetchedVideos.length > 0 ? fetchedVideos : SAMPLE_VIDEOS);
      } catch (error) {
        console.warn('Error fetching YouTube videos, using sample videos:', error);
        setVideos(SAMPLE_VIDEOS);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVideos();
  }, []);

  return { videos, isLoading, error };
}