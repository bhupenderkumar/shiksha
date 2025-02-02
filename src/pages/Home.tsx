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
import { useEffect, useState } from 'react';
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

type Photo = {
  photo_reference: string;
};

type Video = {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
  };
};

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
    window.scrollTo(0, 0); // Scroll to top on load
  }, []);

  return (
    <PageAnimation>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full"
          >
            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
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
            <Button size="lg" variant="outline" asChild>
              <Link to="/admission-enquiry">
                Start Admission Process
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide a nurturing environment where every child can thrive and reach their full potential
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {feature.link ? (
                  <Link to={feature.link}>
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <feature.icon className="w-12 h-12 text-primary mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <feature.icon className="w-12 h-12 text-primary mb-4" />
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Process Section */}
      <section className="py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <AnimatedText
              text="Admission Process"
              className="text-3xl font-bold mb-4"
              variant="slideUp"
            />
            <p className="text-muted-foreground">Simple steps to join our school family</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Submit Enquiry</h3>
              <p className="text-muted-foreground">Fill out the admission enquiry form with required details</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Document Submission</h3>
              <p className="text-muted-foreground">Submit required documents for verification</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Interview</h3>
              <p className="text-muted-foreground">Schedule and attend admission interview</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Admission Confirmation</h3>
              <p className="text-muted-foreground">Receive confirmation and join our school family</p>
            </motion.div>
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link to="/admission-enquiry">
                Start Your Journey Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Videos Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Latest School Activities</h2>
          <div className="flex overflow-x-auto space-x-6 pb-4">
            {videos.map((video) => (
              <motion.div
                key={video.id.videoId}
                whileHover={{ scale: 1.02 }}
                className="video-item min-w-[300px] bg-white rounded-xl shadow-lg overflow-hidden"
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

      {/* Achievements Section */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">
                  {achievement.number}
                </div>
                <div className="text-muted-foreground">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
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
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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

      {/* Map Section */}
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
          <div id="map" className="h-96 w-full rounded-lg"></div>
        </div>
      </section>
    </PageAnimation>
  );
}
