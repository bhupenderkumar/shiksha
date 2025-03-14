import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from "framer-motion";
import { PageAnimation } from "@/components/ui/page-animation";
import { LightEffects, GradientText } from "@/components/ui/light-effects";
import { SchoolBuildingHero } from "@/components/home/SchoolBuildingHero";
import { ClassroomFeatures } from "@/components/home/ClassroomFeatures";
import { AdmissionJourney } from "@/components/home/AdmissionJourney";
import { SchoolAssembly } from "@/components/home/SchoolAssembly";
import { SchoolMap } from "@/components/home/SchoolMap";
import { PlaygroundFooter } from "@/components/home/PlaygroundFooter";
import { YouTubeService, VideoItem } from '@/services/youtubeService';
import { fetchPlaceDetails, fetchPlacePhotos, getSchoolLocation } from '@/services/googleMapsService';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedText } from "@/components/ui/animated-text";
import { useTheme } from "@/lib/theme-provider";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import {
  GraduationCap,
  Users,
  BookOpen,
  Heart,
  Star,
  CheckCircle,
  ArrowRight,
  Moon,
  Sun,
} from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

interface MapOptions extends google.maps.MapOptions {
  streetViewControl: boolean;
  mapTypeControl: boolean;
  fullscreenControl: boolean;
}

const mapStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

// Define types
type Video = {
  id: { videoId: string };
  snippet: { title: string };
};

type Review = {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  profile_photo_url: string;
  time: number;
};

type Photo = {
  photo_reference: string;
};

// Features data
const features = [
  {
    icon: GraduationCap,
    title: "Expert Faculty",
    description: "Our experienced teachers are passionate about nurturing young minds",
  },
  {
    icon: Users,
    title: "Small Class Sizes",
    description: "Individual attention for every student with optimal teacher-student ratio",
  },
  {
    icon: BookOpen,
    title: "Modern Curriculum",
    description: "Comprehensive education blending traditional values with modern learning",
  },
  {
    icon: Heart,
    title: "Holistic Development",
    description: "Focus on academic, physical, and emotional growth of every child",
  },
  {
    icon: Star,
    title: "Year-End Feedback",
    description: "Comprehensive feedback system for parents and students",
    link: "/year-end-feedback",
  },
];

// Achievements data from main branch
const achievements = [
  { number: "400+", label: "Happy Students" },
  { number: "10+", label: "Expert Teachers" },
  { number: "95%", label: "Success Rate" },
  { number: "15+", label: "Years of Excellence" },
];

// Testimonials data
const testimonials = [
  {
    name: "Priya Sharma",
    role: "Parent of Class 5 Student",
    rating: 5,
    text: "The school has provided an excellent foundation for my child's future. The teachers are dedicated and the curriculum is well-balanced between academics and extracurricular activities.",
    photo: "/testimonials/parent1.jpg"
  },
  {
    name: "Rajesh Kumar",
    role: "Parent of Class 3 Student",
    rating: 5,
    text: "The teachers here are incredibly supportive and understanding. My child has shown remarkable improvement in both academic performance and confidence since joining First Step School.",
    photo: "/testimonials/parent2.jpg"
  },
  {
    name: "Meera Patel",
    role: "Parent of Class 7 Student",
    rating: 5,
    text: "A perfect blend of traditional values and modern education. The school's focus on holistic development has helped my child excel in both studies and extracurricular activities.",
    photo: "/testimonials/parent3.jpg"
  },
  {
    name: "Amit Singh",
    role: "Parent of Class 4 Student",
    rating: 5,
    text: "The individual attention given to each student is remarkable. The school's commitment to maintaining small class sizes ensures that no child is left behind.",
    photo: "/testimonials/parent4.jpg"
  }
];

// Animation styles for cartoon elements
const cartoonStyles = {
  filter: "saturate(1.4) brightness(1.1) contrast(1.1)",
  position: "relative" as const,
  background: "linear-gradient(120deg, #f0f7ff 0%, #ffffff 100%)",
};

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Map initialization
const mapRef = useRef<HTMLDivElement | null>(null);
const markerRef = useRef<google.maps.Marker | null>(null);
const placeRef = useRef<google.maps.places.PlacesService | null>(null);

const initializeMap = useCallback(() => {
  if (!window.google || !mapRef.current) return;

  const schoolLocation = getSchoolLocation();
  const mapOptions: MapOptions = {
    center: schoolLocation,
    zoom: 15,
    styles: mapStyles,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER,
    },
  };

  const map = new google.maps.Map(mapRef.current, mapOptions);

  // Custom marker with school logo/icon
  const marker = new google.maps.Marker({
    position: schoolLocation,
    map: map,
    icon: {
      url: '/school-marker.svg', // Make sure this image exists in public folder
      scaledSize: new google.maps.Size(40, 40),
    },
    animation: google.maps.Animation.DROP,
    title: SCHOOL_INFO.name,
  });
  markerRef.current = marker;

  // Initialize Places service
  placeRef.current = new google.maps.places.PlacesService(map);

  // Create info window for reviews
  const infoWindow = new google.maps.InfoWindow();

  // Add click listener to marker
  marker.addListener('click', () => {
    if (!placeRef.current) return;

    const request = {
      placeId: SCHOOL_INFO.googlePlaceId,
      fields: ['name', 'rating', 'reviews', 'user_ratings_total'],
    };

    placeRef.current.getDetails(request, (place: any, status: any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        const reviews = place.reviews || [];
        const content = `
          <div class="map-info-window">
            <h3 class="text-lg font-bold mb-2">${SCHOOL_INFO.name}</h3>
            <div class="flex items-center mb-2">
              <span class="text-yellow-500">★</span>
              <span class="ml-1">${place.rating} (${place.user_ratings_total} reviews)</span>
            </div>
            <div class="reviews-container max-h-60 overflow-y-auto">
              ${reviews.slice(0, 3).map((review: any) => `
                <div class="review-item mb-3 p-2 bg-gray-50 rounded">
                  <div class="flex items-center mb-1">
                    <img src="${review.profile_photo_url || '/default-avatar.png'}"
                         alt="Reviewer"
                         class="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <div class="font-semibold">${review.author_name}</div>
                      <div class="text-yellow-500">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                      </div>
                    </div>
                  </div>
                  <p class="text-sm">${review.text.slice(0, 150)}${review.text.length > 150 ? '...' : ''}</p>
                </div>
              `).join('')}
            </div>
            <a href="https://www.google.com/maps/place/?q=place_id:${SCHOOL_INFO.googlePlaceId}"
               target="_blank"
               class="text-blue-500 hover:text-blue-700 text-sm mt-2 inline-block">
              View all reviews on Google Maps
            </a>
          </div>
        `;
        // Use type assertion to fix TypeScript error
        (infoWindow as any).setContent(content);
        infoWindow.open(map, marker);
      }
    });
  });
}, []);

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  // Theme is used by child components

  useEffect(() => {
    const getVideos = async () => {
      const latestVideos = await YouTubeService.getLatestVideos();
      // Convert VideoItem[] to Video[] format
      const formattedVideos = latestVideos.map((video: VideoItem) => ({
        id: { videoId: video.id },
        snippet: { title: video.title }
      }));
      setVideos(formattedVideos);
    };

    const loadGoogleMapsScript = () => {
      try {
        if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
          console.error('Google Maps API key is not set in environment variables');
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.onerror = () => console.error('Failed to load Google Maps script');
        script.onload = initializeMap;
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    const fetchPlaceData = async () => {
      try {
        const placeData = await fetchPlaceDetails();
        if (placeData) {
          setReviews(placeData.reviews || []);
          const photoUrls = await Promise.all(
            (placeData.photos || []).slice(0, 8).map((photo: Photo) =>
              fetchPlacePhotos(photo.photo_reference)
            )
          );
          setPhotos(photoUrls.filter((url: string | null) => url !== null) as string[]);
        }
      } catch (error) {
        console.error('Error fetching place data:', error);
      }
    };

    loadGoogleMapsScript();
    fetchPlaceData();
    getVideos();
    window.scrollTo(0, 0); // Scroll to top on load
  }, []);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  return (
    <PageAnimation>
      <div className="relative min-h-screen">
        <LightEffects />
        
        {/* Hero Section */}
        <SchoolBuildingHero />
        
        {/* Features Section */}
        <ClassroomFeatures features={features} />
        
        {/* Admission Process Section */}
        <AdmissionJourney />
        
        {/* Testimonials Section */}
        <SchoolAssembly testimonials={testimonials} />
        
        {/* Map Section */}
        <SchoolMap />
        
        {/* Footer */}
        <PlaygroundFooter />
      </div>
    </PageAnimation>
  );
}
