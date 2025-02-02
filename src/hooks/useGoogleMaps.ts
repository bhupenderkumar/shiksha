import { useEffect, useState } from 'react';
import { getSchoolLocation } from '@/services/googleMapsService';
import { SCHOOL_INFO } from '@/constants/schoolInfo';

interface UseGoogleMapsReturn {
  isLoading: boolean;
  error: Error | null;
}

export function useGoogleMaps(mapElementId: string): UseGoogleMapsReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          throw new Error('Google Maps API key is not set in environment variables');
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.onerror = () => {
          setError(new Error('Failed to load Google Maps script'));
          setIsLoading(false);
        };
        script.onload = () => initMap();
        document.body.appendChild(script);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error loading Google Maps'));
        setIsLoading(false);
      }
    };

    const initMap = () => {
      try {
        if (!window.google?.maps) {
          throw new Error('Google Maps not loaded');
        }

        const mapElement = document.getElementById(mapElementId);
        if (!mapElement) {
          throw new Error('Map container element not found');
        }

        const location = getSchoolLocation();
        const map = new window.google.maps.Map(mapElement, {
          center: location,
          zoom: 15,
        });

        new window.google.maps.Marker({
          position: location,
          map: map,
          title: SCHOOL_INFO.name,
        });

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error initializing map'));
      } finally {
        setIsLoading(false);
      }
    };

    loadGoogleMapsScript();

    // Cleanup
    return () => {
      const script = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      );
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [mapElementId]);

  return { isLoading, error };
}

// Add type definition for window.google
declare global {
  interface Window {
    google: any;
  }
}