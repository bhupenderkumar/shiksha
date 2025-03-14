import { useEffect, useState } from 'react';
import { PageAnimation } from "@/components/ui/page-animation";
import { LightEffects } from "@/components/ui/light-effects";
import { SchoolBuildingHero } from "@/components/home/SchoolBuildingHero";
import { ClassroomFeatures } from "@/components/home/ClassroomFeatures";
import { AdmissionJourney } from "@/components/home/AdmissionJourney";
import { SchoolAssembly } from "@/components/home/SchoolAssembly";
import { SchoolMap } from "@/components/home/SchoolMap";
import { PlaygroundFooter } from "@/components/home/PlaygroundFooter";
import { YouTubeService, VideoItem } from '@/services/youtubeService';
import { fetchPlaceDetails, fetchPlacePhotos } from '@/services/googleMapsService';
import {
  GraduationCap,
  Users,
  BookOpen,
  Heart,
  Star,
} from "lucide-react";

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

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const getVideos = async () => {
      const latestVideos = await YouTubeService.getLatestVideos();
      // Convert VideoItem[] to Video[] format
      const formattedVideos = latestVideos.map(video => ({
        id: { videoId: video.id },
        snippet: { title: video.title }
      }));
      setVideos(formattedVideos);
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

    fetchPlaceData();
    getVideos();
    window.scrollTo(0, 0); // Scroll to top on load
  }, []);

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
