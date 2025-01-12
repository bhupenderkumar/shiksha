import axios from 'axios';

const API_KEY = 'AIzaSyCzU8oifsMi0AENEjRSiPQ87iRycT5ByTo';
const CHANNEL_ID = 'UCIbKG2jiKpOuV0R1dozJdIw'; // Channel ID for First Step School Zone

export const fetchLatestVideos = async () => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        key: API_KEY,
        channelId: CHANNEL_ID,
        part: 'snippet',
        order: 'date',
        maxResults: 5,
      },
    });
    return response.data.items; // Return the list of videos
  } catch (error) {
    console.error('Error fetching latest videos:', error);
    return [];
  }
};

export const fetchMostViewedVideo = async () => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        key: API_KEY,
        part: 'snippet,statistics',
        chart: 'mostViewed',
        maxResults: 1,
        regionCode: 'IN', // Specify region if needed
      },
    });
    return response.data.items[0]; // Return the most viewed video
  } catch (error) {
    console.error('Error fetching most viewed video:', error);
    return null;
  }
};
