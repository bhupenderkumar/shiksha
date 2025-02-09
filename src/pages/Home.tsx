import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import {
  Rocket,
  GraduationCap,
  Users,
  Award,
  BookOpen,
  Heart,
  Star,
  CheckCircle,
  ArrowRight,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageAnimation } from "@/components/ui/page-animation";
import { AnimatedText } from "@/components/ui/animated-text";
import { Link } from "react-router-dom";
import { fetchPlaceDetails, fetchPlacePhotos, getSchoolLocation } from '@/services/googleMapsService';
import { useTheme } from "@/lib/theme-provider";
import { SlipManagementSection } from "@/pages/Home/components/SlipManagementSection";

declare global {
  interface Window {
    google: any;
  }
}

type Review = {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  profile_photo_url: string;
  time: number;
};

interface Photo {
  photo_reference: string;
}

interface Video {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
  };
}

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

const achievements = [
  { number: "400+", label: "Happy Students" },
  { number: "10+", label: "Expert Teachers" },
  { number: "95%", label: "Success Rate" },
  { number: "15+", label: "Years of Excellence" },
];

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

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const themeContext = useTheme();

  useEffect(() => {
    const getVideos = async () => {
      const latestVideos = await fetchLatestVideos();
      setVideos(latestVideos);
    };

    const loadGoogleMapsScript = () => {
      try {
        if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
          console.error('Google Maps API key is not set in environment variables');
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
        script.async = true;
        script.onerror = () => console.error('Failed to load Google Maps script');
        script.onload = initMap;
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    const initMap = () => {
      try {
        if (!window.google?.maps) {
          console.error('Google Maps not loaded');
          return;
        }

        const mapElement = document.getElementById('map');
        if (!mapElement) {
          console.error('Map container element not found');
          return;
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
      } catch (error) {
        console.error('Error initializing map:', error);
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
          setPhotos(photoUrls.filter(url => url !== null));
        }
      } catch (error) {
        console.error('Error fetching place data:', error);
      }
    };

    loadGoogleMapsScript();
    fetchPlaceData();
    getVideos();
  }, []);

  return (
    <PageAnimation>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        {/* ... (existing hero section content) ... */}
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        {/* ... (existing features section content) ... */}
      </section>

      {/* Admission Process Section */}
      <section className="py-24 bg-gradient-to-b from-background to-primary/5">
        {/* ... (existing admission process section content) ... */}
      </section>

      {/* Latest Videos Section */}
      <section className="py-12 px-4">
        {/* ... (existing videos section content) ... */}
      </section>

      {/* Achievements Section */}
      <section className="py-24 bg-primary/5">
        {/* ... (existing achievements section content) ... */}
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Quick Links</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Access important features and information quickly
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/admission-enquiry">
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-primary hover:text-white"
              >
                Admission Enquiry <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link to="/year-end-feedback">
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-primary hover:text-white"
              >
                Submit Year-End Feedback <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link to="/view-year-end-feedback">
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-primary hover:text-white"
              >
                View Feedback Records <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link to="/slip-management/new">
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-primary hover:text-white"
              >
                Manage Slip Templates <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Slip Management Section */}
      <section className="py-24 bg-gradient-to-b from-primary/5 to-background">
        <SlipManagementSection />
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-primary/5 to-background">
        {/* ... (existing testimonials section content) ... */}
      </section>

      {/* Map Section */}
      <section className="py-24 bg-primary/5">
        {/* ... (existing map section content) ... */}
      </section>
    </PageAnimation>
  );
}

async function fetchLatestVideos(): Promise<Video[]> {
  try {
    const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
    const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

    if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
      console.error('YouTube API key or Channel ID not set in environment variables');
      return [];
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=5&type=video`
    );

    if (!response.ok) {
      throw new Error(`YouTube API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      id: { videoId: item.id.videoId },
      snippet: { title: item.snippet.title }
    }));
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}
