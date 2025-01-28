import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { SCHEMA } from '@/lib/constants';

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const PLACE_ID = 'ChIJQZ8W_lnmDDkRKKD9jMgstPA'; // First Step Public School's Place ID

export async function getPlaceDetails() {
  try {
    const { data: cachedData, error: cacheError } = await supabase
      .schema(SCHEMA)
      .from('PlaceDetails')
      .select('*')
      .eq('place_id', PLACE_ID)
      .single();

    // Check if we have fresh cached data (less than 24 hours old)
    if (cachedData && new Date(cachedData.updated_at).getTime() > Date.now() - 24 * 60 * 60 * 1000) {
      return cachedData.details;
    }

    // If no fresh cache, fetch from Google Maps API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,reviews,photos,formatted_address,formatted_phone_number,user_ratings_total&key=${API_KEY}&reviews_sort=most_relevant`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch place details');
    }

    const data = await response.json();

    // Cache the new data
    const { error: upsertError } = await supabase
      .schema(SCHEMA)
      .from('PlaceDetails')
      .upsert({
        place_id: PLACE_ID,
        details: data.result,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      console.error('Error caching place details:', upsertError);
    }

    return data.result;
  } catch (error) {
    console.error('Error in getPlaceDetails:', error);
    throw error;
  }
}

export async function getPlacePhoto(photoReference: string) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch photo');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error in getPlacePhoto:', error);
    throw error;
  }
}
