import { useEffect } from 'react';
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { QuickLinks } from "./components/QuickLinks";
import { FeaturesSection } from "./components/FeaturesSection";
import { AchievementsSection } from "./components/AchievementsSection";
import { AdmissionProcess } from "./components/AdmissionProcess";
import { VideosSection } from "./components/VideosSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { MapSection } from "./components/MapSection";
import { Footer } from "./components/Footer";

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden">
      {/* Sticky Navigation */}
      <Navbar />

      {/* Hero */}
      <HeroSection />

      {/* Quick Links */}
      <QuickLinks />

      {/* Features */}
      <FeaturesSection />

      {/* Achievements */}
      <AchievementsSection />

      {/* Admission Process */}
      <AdmissionProcess />

      {/* Videos */}
      <VideosSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Map & Contact */}
      <MapSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}