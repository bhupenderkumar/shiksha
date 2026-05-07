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
import { SEO } from "@/components/SEO";
import { SCHOOL_INFO } from "@/constants/schoolInfo";

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden">
      <SEO
        title="First Step Pre School & Primary School – Best Play School in Saurabh Vihar, Badarpur, Delhi | Admissions Open 2026-27"
        description="Top-rated 4.9★ play school, nursery, LKG, UKG and primary school in Saurabh Vihar, Jaitpur, Badarpur, New Delhi 110044. Activity-based learning, safe CCTV campus, expert teachers. Admissions open for 2026-27. Call +91 96679 35518."
        path="/"
      />
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

      {/* Floating Click-to-Call Button (mobile-first lead capture) — school brand red */}
      <a
        href={`tel:+${SCHOOL_INFO.whatsappNumber}`}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-[#C73E2C] hover:bg-[#A8311F] text-white rounded-full shadow-lg shadow-red-200 hover:shadow-red-300 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ring-2 ring-[#F5C518]"
        aria-label="Call school for admissions"
        onClick={() => {
          // Google Ads conversion tracking
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'phone_click', { event_category: 'lead', event_label: 'floating_call_button' });
          }
        }}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"/>
        </svg>
      </a>

      {/* Floating "Apply Now" logo button — primary admission CTA */}
      <a
        href="/admission-enquiry"
        className="fixed bottom-44 right-6 z-50 w-14 h-14 bg-[#F5E9D7] hover:bg-white rounded-full shadow-lg shadow-yellow-200 hover:shadow-yellow-300 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ring-2 ring-[#C73E2C] overflow-hidden"
        aria-label="Apply for admission 2026-27"
        title="Apply for Admission 2026-27"
        onClick={() => {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'admission_click', { event_category: 'lead', event_label: 'floating_logo_button' });
          }
        }}
      >
        <img
          src="/assets/images/logo.PNG"
          alt="First Step Pre School & Primary School"
          className="w-full h-full object-cover"
          width="56"
          height="56"
          loading="eager"
        />
      </a>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${SCHOOL_INFO.whatsappNumber}?text=${encodeURIComponent('Hi, I would like to know about admissions at First Step Pre School & Primary School.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg shadow-green-200 hover:shadow-green-300 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Chat on WhatsApp for admissions"
        onClick={() => {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'whatsapp_click', { event_category: 'lead', event_label: 'floating_whatsapp_button' });
          }
        }}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}