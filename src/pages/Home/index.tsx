import { useEffect } from 'react';
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { AdmissionProcess } from "./components/AdmissionProcess";
import { VideosSection } from "./components/VideosSection";
import { AchievementsSection } from "./components/AchievementsSection";
import { QuickLinks } from "./components/QuickLinks";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { MapSection } from "./components/MapSection";

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
    // Add dark-landing class to body for the landing page
    document.body.classList.add('dark-landing');
    return () => {
      document.body.classList.remove('dark-landing');
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
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
      
      {/* Map */}
      <MapSection />
      
      {/* Footer gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
    </div>
  );
}