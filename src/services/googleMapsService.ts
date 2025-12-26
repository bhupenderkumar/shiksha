// API key for Google Maps - used by useGoogleMaps hook for map display
const _API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
// Place ID kept for reference if backend proxy is implemented later
const _PLACE_ID = 'ChIJQZ8W_lnmDDkRKKD9jMgstPA'; // First Step Public School's Place ID

// Generate 28 mock reviews with Indian names and context
const mockReviews = Array.from({ length: 28 }, (_, i) => {
  const indianNames = [
    "Sharma", "Kumar", "Gupta", "Verma", "Patel", "Singh", "Yadav", "Malhotra",
    "Agarwal", "Chopra", "Reddy", "Mehra", "Kapoor", "Joshi", "Chauhan", "Tiwari",
    "Saxena", "Bhat", "Nair", "Iyer", "Khanna", "Pandey", "Bansal", "Mittal",
    "Desai", "Shah", "Menon", "Shetty"
  ];
  
  const randomName = `${["Aarav", "Aditi", "Ananya", "Arjun", "Diya", "Ishaan", "Kavya", "Neha", "Pranav", "Riya"][i % 10]} ${indianNames[i]}`;
  const randomClass = ["Nursery", "LKG", "UKG", "Class 1", "Class 2"][Math.floor(Math.random() * 5)];
  
  const texts = [
    `${randomClass} education is excellent! The teachers are very dedicated and caring.`,
    `Great improvement in my child's performance since joining ${randomClass}.`,
    `The school's focus on holistic development in ${randomClass} is commendable.`,
    `Teachers are extremely supportive and understanding in ${randomClass}.`,
    `Best decision to enroll my child in ${randomClass} here.`
  ];
  
  return {
    author_name: randomName,
    rating: Math.floor(Math.random() * 2) + 4, // Random rating between 4-5
    relative_time_description: `${Math.floor(i / 4) + 1} months ago`,
    text: `${texts[i % texts.length]} ${i % 2 === 0 ? 'Jyoti Ma\'am and Bhupender Sir are doing an excellent job.' : 'The facilities and teaching methods are world-class.'}`,
    profile_photo_url: `https://i.pravatar.cc/150?img=${40 + i}`,
    time: new Date().getTime() - (i * 7 * 24 * 60 * 60 * 1000) // Each review 1 week apart
  };
}).sort((a, b) => b.time - a.time); // Sort by most recent first


export const fetchPlaceDetails = async () => {
  // Calculate average rating from mock reviews
  const averageRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;

  // Return mock/fallback data directly since CORS proxy is unreliable
  // For production, consider using a backend proxy or Google's JS SDK
  return {
    rating: parseFloat(averageRating.toFixed(1)),
    reviews: mockReviews,
    user_ratings_total: mockReviews.length,
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
