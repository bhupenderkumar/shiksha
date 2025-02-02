import { useEffect } from 'react';
import { SectionAnimation, PageAnimation } from "@/components/ui/page-animation";
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
    window.scrollTo(0, 0); // Scroll to top on load
  }, []);

  return (
    <PageAnimation>
      <div className="relative">
        {/* Hero with dramatic entrance */}
        <SectionAnimation animation="heroReveal">
          <HeroSection />
        </SectionAnimation>

        {/* Decorative divider */}
        <div className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent to-background/5 -bottom-12 z-10" />

        {/* Features with staggered fade-in */}
        <div className="relative">
          <SectionAnimation animation="fadeInUp" delay="small">
            <FeaturesSection />
          </SectionAnimation>
          
          {/* Connector line */}
          <div className="absolute left-1/2 -translate-x-1/2 h-16 w-px bg-primary/20 -bottom-8" />
        </div>

        {/* Admission process with slide effect */}
        <div className="relative mt-0">
          <SectionAnimation animation="slideInFromRight" delay="medium">
            <AdmissionProcess />
          </SectionAnimation>
        </div>

        {/* Videos with scale animation */}
        <div className="relative mt-8">
          <SectionAnimation animation="scaleIn" delay="small">
            <VideosSection />
          </SectionAnimation>
          
          {/* Decorative waves */}
          <div className="absolute inset-x-0 h-16 -top-8">
            <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                    className="fill-primary/5" />
            </svg>
          </div>
        </div>

        {/* Achievements with dramatic entrance */}
        <div className="relative mt-4">
          <SectionAnimation animation="fadeInUp" delay="medium">
            <AchievementsSection />
          </SectionAnimation>
        </div>

        {/* Quick links with fast pop-in effect */}
        <div className="relative mt-8">
          <SectionAnimation animation="cardPopIn" delay="small">
            <QuickLinks />
          </SectionAnimation>
        </div>

        {/* Testimonials with smooth fade */}
        <div className="relative">
          <SectionAnimation animation="fadeInSlow" delay="medium">
            <TestimonialsSection />
          </SectionAnimation>
          
          {/* Diagonal divider */}
          <div className="absolute inset-x-0 h-24 -bottom-12 bg-gradient-to-br from-background/5 to-primary/5 skew-y-3" />
        </div>

        {/* Map with slide effect */}
        <div className="relative mt-16">
          <SectionAnimation animation="slideInFromBottom" delay="large">
            <MapSection />
          </SectionAnimation>
        </div>
      </div>
    </PageAnimation>
  );
}