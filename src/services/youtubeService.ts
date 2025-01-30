interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
}

class YouTubeService {
  // Using import.meta.env for Vite environment variables
  static API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  static CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

  static async getLatestVideos(): Promise<VideoItem[]> {
    try {
      // For now, return sample data since we don't have API keys configured
      const sampleVideos: VideoItem[] = [
        {
          id: "sample1",
          title: "School Annual Day Celebrations 2024",
          thumbnail: "/images/video-thumb-1.jpg"
        },
        {
          id: "sample2",
          title: "Sports Day Highlights 2024",
          thumbnail: "/images/video-thumb-2.jpg"
        },
        {
          id: "sample3",
          title: "Academic Achievements 2024",
          thumbnail: "/images/video-thumb-3.jpg"
        }
      ];

      // If we have API key configured, use the actual YouTube API
      if (this.API_KEY && this.CHANNEL_ID) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${this.API_KEY}&channelId=${this.CHANNEL_ID}&part=snippet,id&order=date&maxResults=6`
          );
          
          if (!response.ok) {
            console.warn('Failed to fetch from YouTube API, using sample data');
            return sampleVideos;
          }

          const data = await response.json();
          return data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url
          }));
        } catch (error) {
          console.warn('Error fetching from YouTube API, using sample data:', error);
          return sampleVideos;
        }
      }

      return sampleVideos;
    } catch (error) {
      console.error('Error in getLatestVideos:', error);
      return [];
    }
  }
}

export { YouTubeService };
export type { VideoItem };
