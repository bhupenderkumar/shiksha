import { YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID } from '@/lib/constants';
import axios from 'axios';

export const fetchLatestVideos = async () => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        key: YOUTUBE_API_KEY, // Use constant
        channelId: YOUTUBE_CHANNEL_ID, // Use constant
        part: 'snippet',
        order: 'date',
        maxResults: 5,
      },
    });
    return response.data.items; // Return the list of videos
  } catch (error) {
    console.error('Error fetching latest videos:', error);
    return []; // Return an empty array on error
  }
};

export const fetchMostViewedVideo = async () => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        key: YOUTUBE_API_KEY, // Use constant
        part: 'snippet,statistics',
        chart: 'mostViewed',
        maxResults: 1,
        regionCode: 'IN', // Specify region if needed
      },
    });
    return response.data.items[0]; // Return the most viewed video
  } catch (error) {
    console.error('Error fetching most viewed video:', error);
    return null; // Return null on error
  }
};
