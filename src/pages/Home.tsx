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
import { LightEffects, GradientText } from "@/components/ui/light-effects";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchLatestVideos } from '@/services/youtubeService';
import { fetchPlaceDetails, fetchPlacePhotos, getSchoolLocation } from '@/services/googleMapsService';
import { admissionService } from "@/services/admissionService";
import HomePart1 from "@/pages/HomePart1";
import { ProspectiveStudent, Gender } from "@/types/admission";
import { useTheme } from "@/lib/theme-provider";

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

const sparkleAnimation = {
  initial: { opacity: 0, scale: 0 },
  animate: {
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
      times: [0, 0.5, 1]
    }
  }
};

const Sparkle = ({ delay = 0 }) => (
  <motion.div
    style={{
      position: "absolute",
      width: "10px",
      height: "10px",
      background: "gold",
      borderRadius: "50%",
      filter: "blur(1px)",
    }}
    initial="initial"
    animate="animate"
    variants={sparkleAnimation}
    transition={{ delay }}
  />
);

const CartoonBorder = () => (
  <div className="fixed inset-0 pointer-events-none z-10">
    <div className="absolute inset-0 border-8 border-primary/20 rounded-3xl animate-pulse" />
    <div className="absolute inset-0 border-4 border-primary/30 rounded-2xl animate-bounce" style={{ animationDuration: '3s' }} />
    {[...Array(20)].map((_, i) => (
      <Sparkle key={i} delay={i * 0.1} style={{ 
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }} />
    ))}
  </div>
);

const glowingLightAnimation = {
  initial: { opacity: 0.3, scale: 1 },
  animate: {
    opacity: [0.3, 1, 0.3],
    scale: [1, 1.2, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }
  }
};

const travelingLightAnimation = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: [0, 1],
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const GlowingLight = ({ x, y, color, delay = 0 }) => (
  <motion.div
    style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 70%)`,
      filter: "blur(5px)",
    }}
    variants={glowingLightAnimation}
    initial="initial"
    animate="animate"
    transition={{
      delay,
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse"
    }}
  />
);

const BorderLights = () => (
  <div className="fixed inset-0 pointer-events-none z-10">
    <svg
      style={{ 
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
      }}
      viewBox="0 0 100 100"
      fill="none"
    >
      {/* Top border light */}
      <motion.path
        d="M0,0 L100,0"
        stroke="rgba(255, 215, 0, 0.3)"
        strokeWidth="0.5"
        variants={travelingLightAnimation}
        initial="initial"
        animate="animate"
      />
      {/* Right border light */}
      <motion.path
        d="M100,0 L100,100"
        stroke="rgba(255, 215, 0, 0.3)"
        strokeWidth="0.5"
        variants={travelingLightAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.75 }}
      />
      {/* Bottom border light */}
      <motion.path
        d="M100,100 L0,100"
        stroke="rgba(255, 215, 0, 0.3)"
        strokeWidth="0.5"
        variants={travelingLightAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 1.5 }}
      />
      {/* Left border light */}
      <motion.path
        d="M0,100 L0,0"
        stroke="rgba(255, 215, 0, 0.3)"
        strokeWidth="0.5"
        variants={travelingLightAnimation}
        initial="initial"
        animate="animate"
        transition={{ delay: 2.25 }}
      />
    </svg>
  </div>
);

const FloatingLights = () => (
  <>
    {[...Array(15)].map((_, i) => (
      <GlowingLight
        key={i}
        x={Math.random() * 100}
        y={Math.random() * 100}
        color={`hsl(${Math.random() * 60 + 40}, 100%, 70%)`}
        delay={i * 0.2}
      />
    ))}
  </>
);

const lightBorderAnimation = {
  hidden: { opacity: 0, pathLength: 0 },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

const BorderLight = () => (
  <motion.div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: "none",
      zIndex: 10,
    }}
  >
    <svg
      style={{ width: "100%", height: "100%" }}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.rect
        x="1"
        y="1"
        width="98"
        height="98"
        rx="8"
        stroke="rgba(255, 215, 0, 0.5)"
        strokeWidth="2"
        initial="hidden"
        animate="visible"
        variants={lightBorderAnimation}
      />
    </svg>
  </motion.div>
);

const mapRef = useRef<google.maps.Map | null>(null);
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
  mapRef.current = map;

  // Custom marker with school logo/icon
  const marker = new google.maps.Marker({
    position: schoolLocation,
    map: map,
    icon: {
      url: '/school-marker.png', // Make sure to add this image to your public folder
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
      placeId: SCHOOL_INFO.googlePlaceId, // Add this to your SCHOOL_INFO constants
      fields: ['name', 'rating', 'reviews', 'user_ratings_total'],
    };

    placeRef.current.getDetails(request, (place, status) => {
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
              ${reviews.slice(0, 3).map(review => `
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
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      }
    });
  });

}, []);

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();

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
          setPhotos(photoUrls.filter(url => url !== null));
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

        <section className="relative py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Welcome to{" "}
                  <GradientText className="font-bold">
                    {SCHOOL_INFO.name}
                  </GradientText>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Nurturing minds, building futures, and creating tomorrow's leaders
                </p>
              </motion.div>

              <div className="flex gap-4 mb-12">
                <Button
                  size="lg"
                  className="glow"
                  asChild
                >
                  <Link to="/admission-enquiry">
                    Apply Now <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="shimmer"
                  asChild
                >
                  <Link to="/login">
                    Student Login
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Choose <GradientText>{SCHOOL_INFO.name}</GradientText>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover-lift h-full">
                    <CardContent className="p-6">
                      <feature.icon className="w-12 h-12 text-primary mb-4" />
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-gradient-to-b from-pink-50/50 via-blue-50/50 to-purple-50/50 dark:from-pink-950/30 dark:via-blue-950/30 dark:to-purple-950/30">
          <div className="container mx-auto container-padding">
            <div className="text-center mb-16">
              <AnimatedText
                text="Admission Process"
                className="text-3xl font-bold mb-4 text-gradient"
                variant="slideUp"
              />
              <p className="text-muted-foreground">Simple steps to join our school family</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((num, index) => (
                <motion.div
                  key={num}
                  variants={pulseAnimation}
                  initial="initial"
                  animate="animate"
                  className="text-center glass card-hover p-6 rounded-lg"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4 animate-float">
                    <span className="text-2xl font-bold text-primary">{num}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{num === 1 ? 'Submit Enquiry' : num === 2 ? 'Document Submission' : num === 3 ? 'Interview' : 'Admission Confirmation'}</h3>
                  <p className="text-muted-foreground">{num === 1 ? 'Fill out the admission enquiry form with required details' : num === 2 ? 'Submit required documents for verification' : num === 3 ? 'Schedule and attend admission interview' : 'Receive confirmation and join our school family'}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button size="lg" className="button-glow gradient-primary text-white" asChild>
                <Link to="/admission-enquiry">
                  Start Your Journey Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container mx-auto container-padding">
            <h2 className="text-3xl font-bold text-center mb-8 text-gradient">Latest School Activities</h2>
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-secondary">
              {videos.map((video) => (
                <motion.div
                  key={video.id.videoId}
                  whileHover={{ scale: 1.02 }}
                  className="video-item min-w-[300px] glass card-hover rounded-xl overflow-hidden"
                >
                  <iframe
                    width="100%"
                    height="200"
                    src={`https://www.youtube.com/embed/${video.id.videoId}`}
                    title={video.snippet.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold line-clamp-2">{video.snippet.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="container mx-auto container-padding">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center glass p-6 rounded-lg card-hover"
                >
                  <div className="text-4xl font-bold text-gradient mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-muted-foreground">{achievement.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container mx-auto container-padding">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4 text-gradient">Quick Links</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Access important features and information quickly
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/admission-enquiry">
                <Button
                  variant="outline"
                  className="w-full justify-between button-glow card-hover glass"
                >
                  Admission Enquiry <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/year-end-feedback">
                <Button
                  variant="outline"
                  className="w-full justify-between button-glow card-hover glass"
                >
                  Submit Year-End Feedback <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/view-year-end-feedback">
                <Button
                  variant="outline"
                  className="w-full justify-between button-glow card-hover glass"
                >
                  View Feedback Records <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <AnimatedText
                text="What Parents Say"
                className="text-3xl font-bold mb-4"
                variant="slideUp"
              />
              <p className="text-muted-foreground">Hear from our school community</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 mr-3 flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-500 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? 'fill-current' : 'fill-none'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{testimonial.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <AnimatedText
                text="Our Location"
                className="text-3xl font-bold mb-4"
                variant="slideUp"
              />
              <p className="text-muted-foreground">Find us on the map</p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-lg overflow-hidden shadow-lg"
            >
              <div 
                ref={mapRef} 
                className="h-96 w-full rounded-lg"
                style={{ border: '4px solid rgba(var(--primary), 0.1)' }}
              />
            </motion.div>
          </div>
        </section>
      </div>
    </PageAnimation>
  );
}
