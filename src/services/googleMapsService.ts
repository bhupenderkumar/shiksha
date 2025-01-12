import axios from 'axios';

const API_KEY = 'AIzaSyC1eS7zgQrBrIUC6CiRJ3K4RXG2JQJeaDw';
const PLACE_ID = 'ChIJQZ8W_lnmDDkRKKD9jMgstPA'; // First Step Public School's Place ID

export const fetchPlaceDetails = async () => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: PLACE_ID,
          fields: 'rating,reviews,photos,formatted_address,formatted_phone_number',
          key: API_KEY,
        },
      }
    );
    return response.data.result;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};

export const fetchPlacePhotos = async (photoReference: string) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/photo`,
      {
        params: {
          maxwidth: 400,
          photo_reference: photoReference,
          key: API_KEY,
        },
        responseType: 'blob',
      }
    );
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Error fetching photo:', error);
    return null;
  }
};

export const getSchoolLocation = () => {
  return {
    lat: 28.5086264, // First Step Public School's latitude
    lng: 77.3246508, // First Step Public School's longitude
  };
};

export const getSchoolAddress = () => {
  return {
    address: "The First Step Public School, Saurabh Vihar, Jaitpur, New Delhi, Delhi 110044",
    area: "Badarpur, Jaitpur, Saurabh Vihar",
    city: "New Delhi",
    pincode: "110044",
    googleMapsUrl: "https://www.google.com/maps/place/The+First+Step+Public+School+%7C+Best+School+in+badarpur+%7C+Jaitpur+%7C+Saurabh+Vihar/@28.5086273,77.3220784,17z"
  };
};
