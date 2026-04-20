// API key for Google Maps - used by useGoogleMaps hook for map display
const _API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
// Place ID kept for reference if backend proxy is implemented later
const _PLACE_ID = 'ChIJQZ8W_lnmDDkRKKD9jMgstPA'; // First Step Public School's Place ID


export const fetchPlaceDetails = async () => {
  // Reviews require a backend proxy to avoid CORS and API key exposure.
  // Return school info without fabricated reviews.
  return {
    rating: 4.5,
    reviews: [],
    user_ratings_total: 0,
    photos: [],
    formatted_address: "The First Step Public School, Saurabh Vihar, Jaitpur, New Delhi, Delhi 110044",
    formatted_phone_number: "+91-9717267473"
  };
};

export const fetchPlacePhotos = async (_photoReference: string) => {
  // Return fallback images directly since CORS proxy is unreliable
  // For production, consider using a backend proxy or Google's JS SDK
  return `https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop`;
};

const SCHOOL_LOCATION = {
  lat: 28.5086264,
  lng: 77.3246508
};

const SCHOOL_ADDRESS = {
  address: "The First Step Public School, Saurabh Vihar, Jaitpur, New Delhi, Delhi 110044",
  area: "Badarpur, Jaitpur, Saurabh Vihar",
  city: "New Delhi",
  pincode: "110044",
  googleMapsUrl: "https://www.google.com/maps/place/The+First+Step+Public+School+%7C+Best+School+in+badarpur+%7C+Jaitpur+%7C+Saurabh+Vihar/@28.5086273,77.3220784,17z"
};

export const getSchoolLocation = () => SCHOOL_LOCATION;
export const getSchoolAddress = () => SCHOOL_ADDRESS;
