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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageAnimation } from "@/components/ui/page-animation";
import { AnimatedText } from "@/components/ui/animated-text";
import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { YouTubeService, VideoItem } from '@/services/youtubeService';

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

type Photo = {
  photo_reference: string;
};

import { fetchPlaceDetails, fetchPlacePhotos, getSchoolLocation } from '@/services/googleMapsService';
import { AdmissionEnquiryForm } from '@/components/admission/AdmissionEnquiryForm';

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
];

const achievements = [
  { number: "1000+", label: "Happy Students" },
  { number: "50+", label: "Expert Teachers" },
  { number: "95%", label: "Success Rate" },
  { number: "15+", label: "Years of Excellence" },
];

const testimonials = [
  {
    quote: "The school has provided an excellent foundation for my child's future.",
    author: "Parent of Class 5 Student",
  },
  {
    quote: "The teachers here are incredibly dedicated and supportive.",
    author: "Parent of Class 3 Student",
  },
  {
    quote: "A perfect blend of academics and extracurricular activities.",
    author: "Parent of Class 7 Student",
  },
];

export default function HomePart1() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const getVideos = async () => {
      const latestVideos = await YouTubeService.getLatestVideos();
      setVideos(latestVideos);
    };

    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    };

    const initMap = () => {
      const location = getSchoolLocation();
      const map = new window.google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 15,
      });
      new window.google.maps.Marker({
        position: location,
        map: map,
        title: SCHOOL_INFO.name,
      });
    };

    const fetchPlaceData = async () => {
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
    };

    loadGoogleMapsScript();
    fetchPlaceData();
    getVideos();
    window.scrollTo(0, 0); // Scroll to top on load
  }, []);

  return (
    <PageAnimation>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-pattern" />
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center"
            >
              <Rocket className="w-12 h-12 text-primary" />
            </motion.div>
            <AnimatedText
              text={SCHOOL_INFO.name}
              className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
              variant="slideUp"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Nurturing young minds, building bright futures. Join us in our journey of excellence in education.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" asChild>
                <Link to="/login">
                  Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
              <Link to="/register">
                  Signup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </PageAnimation>
  );
}