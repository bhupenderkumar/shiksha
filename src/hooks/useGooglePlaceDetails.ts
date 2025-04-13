import { useState, useEffect } from 'react';
import { fetchPlaceDetails, fetchPlacePhotos } from '@/services/googleMapsService';

interface GooglePlaceDetails {
  rating: number;
  reviews: {
    author_name: string;
    rating: number;
    relative_time_description: string;
    text: string;
    profile_photo_url: string;
    time: number;
  }[];
  user_ratings_total: number;
  photos: {
    photo_reference: string;
    height: number;
    width: number;
    html_attributions: string[];
  }[];
  formatted_address: string;
  formatted_phone_number: string;
}

interface UseGooglePlaceDetailsReturn {
  isLoading: boolean;
  error: Error | null;
  placeDetails: GooglePlaceDetails | null;
  photoUrls: string[];
}

export function useGooglePlaceDetails(): UseGooglePlaceDetailsReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [placeDetails, setPlaceDetails] = useState<GooglePlaceDetails | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    const loadPlaceDetails = async () => {
      try {
        setIsLoading(true);
        const details = await fetchPlaceDetails();
        setPlaceDetails(details);

        // Fetch photo URLs if photos are available
        if (details.photos && details.photos.length > 0) {
          const photoPromises = details.photos
            .slice(0, 6) // Limit to 6 photos to avoid too many requests
            .map((photo: { photo_reference: string }) => fetchPlacePhotos(photo.photo_reference));
          
          const urls = await Promise.all(photoPromises);
          setPhotoUrls(urls);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error fetching place details'));
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaceDetails();
  }, []);

  return { isLoading, error, placeDetails, photoUrls };
}