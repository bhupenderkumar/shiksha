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

declare global {
  interface Window {
    google: any;
  }
}

const google = window.google;

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
import { fetchPlaceDetails, fetchPlacePhotos, getSchoolLocation } from '@/services/googleMapsService';

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

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const getVideos = async () => {
      const latestVideos = await fetchLatestVideos();
      setVideos(latestVideos);
    };

    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    };

    const initMap = () => {
      const location = getSchoolLocation();
      const map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 15,
      });
      new google.maps.Marker({
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
          (placeData.photos || []).slice(0, 8).map(photo => 
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

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <AnimatedText
              text="Why Choose Us?"
              className="text-3xl font-bold mb-4"
              variant="slideUp"
            />
            <p className="text-muted-foreground">Discover what makes us stand out</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/60 transition-all">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4"
                      >
                        <Icon className="w-6 h-6 text-primary" />
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
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
                      <img
                        src={review.profile_photo_url}
                        alt={review.author_name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-semibold">{review.author_name}</p>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-current' : 'fill-none'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.text}</p>
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
              <h3 className="text-lg font-semibold mb-2">Confirmation</h3>
              <p className="text-muted-foreground">Receive admission confirmation and complete enrollment</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Admission Enquiry Section */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <AnimatedText
              text="Start Your Journey"
              className="text-3xl font-bold mb-4"
              variant="slideUp"
            />
            <p className="text-muted-foreground">Submit an admission enquiry today</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">Admission Enquiry</h3>
                    <p className="text-muted-foreground">
                      Take the first step towards securing your child's future. Submit an enquiry and our admissions team will get in touch with you.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
                      <Link to="/admission/enquiry">
                        Submit Enquiry
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedText
              text="Begin Your Child's Journey"
              className="text-3xl font-bold mb-4"
              variant="slideUp"
            />
            <p className="text-muted-foreground mb-8">
              Take the first step towards your child's bright future
            </p>
            <div className="space-y-4">
              <p className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>World-class education at affordable fees</span>
              </p>
              <p className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Safe and nurturing environment</span>
              </p>
              <p className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Experienced and caring faculty</span>
              </p>
            </div>
            <div className="mt-8">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Contact Us Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-muted-foreground">{SCHOOL_INFO.address}</p>
              <p className="text-muted-foreground">{SCHOOL_INFO.phone}</p>
              <p className="text-muted-foreground">{SCHOOL_INFO.email}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/admission">Admissions</Link></li>
                <li><Link to="/facilities">Facilities</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {/* Add social media icons/links here */}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} {SCHOOL_INFO.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </PageAnimation>
  );
}
