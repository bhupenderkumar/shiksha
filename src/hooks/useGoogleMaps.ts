import { useEffect, useState, useCallback } from 'react';
import { getSchoolLocation } from '@/services/googleMapsService';
import { SCHOOL_INFO } from '@/constants/schoolInfo';

// Static flag to track if the script is already being loaded or loaded
let googleMapsScriptLoaded = false;
let googleMapsScriptLoading = false;

interface UseGoogleMapsReturn {
  isLoading: boolean;
  error: Error | null;
}

interface UseGoogleMapsOptions {
  maxRetries?: number;
  retryInterval?: number;
  timeout?: number;
}

export function useGoogleMaps(
  mapElementId: string,
  options: UseGoogleMapsOptions = {}
): UseGoogleMapsReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const {
    maxRetries = 10,
    retryInterval = 300,
    timeout = 10000
  } = options;

  // Function to check if element exists and is visible
  const isElementReady = useCallback((elementId: string): boolean => {
    const element = document.getElementById(elementId);
    if (!element) return false;
    
    // Check if element is visible (has dimensions and is not hidden)
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }, []);

  // Initialize map when element is ready
  const initMap = useCallback(() => {
    try {
      if (!window.google?.maps) {
        throw new Error('Google Maps not loaded');
      }

      if (!isElementReady(mapElementId)) {
        throw new Error('Map container element not found or not visible');
      }

      const mapElement = document.getElementById(mapElementId);
      const location = getSchoolLocation();
      const map = new window.google.maps.Map(mapElement!, {
        center: location,
        zoom: 15,
      });

      new window.google.maps.Marker({
        position: location,
        map: map,
        title: SCHOOL_INFO.name,
      });

      setError(null);
      setIsLoading(false);
      return true; // Return true to indicate successful initialization
    } catch (err) {
      // If we haven't exceeded max retries, we'll try again
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        return false; // Return false to indicate initialization failed
      }
      
      // Max retries exceeded, set error
      setError(err instanceof Error ? err : new Error('Error initializing map'));
      setIsLoading(false);
      return true; // Return true to indicate we're done trying
    }
  }, [mapElementId, retryCount, maxRetries, isElementReady]);

  useEffect(() => {
    let timeoutId: number | undefined;
    let retryTimeoutId: number | undefined;
    
    const loadGoogleMapsScript = () => {
      // If script is already loaded, attempt initialization directly
      if (googleMapsScriptLoaded && window.google?.maps) {
        attemptInitialization();
        return;
      }
      
      // If script is currently loading, wait for it
      if (googleMapsScriptLoading) {
        const checkGoogleMaps = () => {
          if (window.google?.maps) {
            attemptInitialization();
          } else {
            setTimeout(checkGoogleMaps, 100);
          }
        };
        setTimeout(checkGoogleMaps, 100);
        return;
      }
      
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          throw new Error('Google Maps API key is not set in environment variables');
        }

        // Mark as loading before appending script
        googleMapsScriptLoading = true;
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
        script.async = true;
        script.onerror = () => {
          googleMapsScriptLoading = false;
          setError(new Error('Failed to load Google Maps script'));
          setIsLoading(false);
        };
        script.onload = () => {
          googleMapsScriptLoaded = true;
          googleMapsScriptLoading = false;
          attemptInitialization();
        };
        document.body.appendChild(script);
      } catch (err) {
        googleMapsScriptLoading = false;
        setError(err instanceof Error ? err : new Error('Error loading Google Maps'));
        setIsLoading(false);
      }
    };

    // Function to attempt map initialization with retries
    const attemptInitialization = () => {
      if (!window.google?.maps) return;
      
      const initialized = initMap();
      
      if (!initialized && retryCount < maxRetries) {
        // Schedule next retry
        retryTimeoutId = window.setTimeout(attemptInitialization, retryInterval);
      }
    };

    loadGoogleMapsScript();
    
    // Set a timeout to prevent infinite retries
    timeoutId = window.setTimeout(() => {
      if (isLoading) {
        setError(new Error(`Map initialization timed out after ${timeout}ms`));
        setIsLoading(false);
      }
    }, timeout);

    // Cleanup
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (retryTimeoutId) window.clearTimeout(retryTimeoutId);
      
      // Don't remove the script on component unmount
      // This prevents issues with multiple script loading/removal
      // The script will be reused by other instances
    };
  }, [mapElementId, initMap, retryCount, maxRetries, retryInterval, timeout, isLoading]);

  return { isLoading, error };
}

// Add type definition for window.google
declare global {
  interface Window {
    google: any;
  }
}