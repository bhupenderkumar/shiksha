import { motion } from "framer-motion";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowUp } from "lucide-react";
import { StudentCharacter } from "@/components/animations/characters/StudentCharacter";
import { useTheme } from "@/lib/theme-provider";

interface PlaygroundFooterProps {
  className?: string;
}

export function PlaygroundFooter({ className = "" }: PlaygroundFooterProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Animation variants
  const floatingAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const bounceAnimation = {
    animate: {
      y: [0, -5, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };

  // Playground colors
  const playgroundColors = {
    grass: isDark ? "#4c566a" : "#a3be8c",
    sand: isDark ? "#d8dee9" : "#ffe8cc",
    equipment: isDark ? "#5e81ac" : "#4c6ef5",
    slide: isDark ? "#bf616a" : "#fa5252",
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className={`relative pt-32 pb-8 overflow-hidden ${className}`}>
      {/* Playground Background */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 z-0"
        style={{ background: playgroundColors.grass }}
      />
      <div 
        className="absolute bottom-0 left-1/4 right-1/4 h-16 z-10 rounded-t-full"
        style={{ background: playgroundColors.sand }}
      />

      {/* Playground Equipment */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10">
        <svg width="200" height="100" viewBox="0 0 200 100" fill="none">
          {/* Slide */}
          <path 
            d="M50,10 L100,80 L80,80 L30,10 Z" 
            fill={playgroundColors.slide}
          />
          <rect x="30" y="10" width="20" height="5" fill={playgroundColors.equipment} />
          
          {/* Swing Set */}
          <rect x="120" y="20" width="5" height="60" fill={playgroundColors.equipment} />
          <rect x="170" y="20" width="5" height="60" fill={playgroundColors.equipment} />
          <rect x="120" y="20" width="55" height="5" fill={playgroundColors.equipment} />
          
          <line x1="130" y1="25" x2="130" y2="70" stroke={isDark ? "#d8dee9" : "#adb5bd"} strokeWidth="2" />
          <line x1="145" y1="25" x2="145" y2="70" stroke={isDark ? "#d8dee9" : "#adb5bd"} strokeWidth="2" />
          <line x1="160" y1="25" x2="160" y2="70" stroke={isDark ? "#d8dee9" : "#adb5bd"} strokeWidth="2" />
          
          <rect x="125" y="70" width="10" height="5" fill={playgroundColors.equipment} />
          <rect x="140" y="70" width="10" height="5" fill={playgroundColors.equipment} />
          <rect x="155" y="70" width="10" height="5" fill={playgroundColors.equipment} />
        </svg>
      </div>

      {/* Student Characters */}
      <div className="absolute bottom-16 left-1/4 z-20 transform scale-75">
        <StudentCharacter variant="jumping" direction="right" />
      </div>
      <div className="absolute bottom-16 right-1/4 z-20 transform scale-75">
        <StudentCharacter variant="jumping" direction="left" delay={0.5} />
      </div>

      {/* Back to Top Button */}
      <motion.button
        className="absolute bottom-32 right-8 z-20 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        variants={bounceAnimation}
        animate="animate"
      >
        <ArrowUp size={20} />
      </motion.button>

      {/* Footer Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <motion.h3 
              className="text-xl font-bold mb-4"
              variants={floatingAnimation}
              animate="animate"
            >
              {SCHOOL_INFO.name}
            </motion.h3>
            <p className="text-muted-foreground mb-4">
              Nurturing young minds, building bright futures. Join us in our journey of excellence in education.
            </p>
            <div className="flex space-x-4">
              <motion.a 
                href={SCHOOL_INFO.socialMedia?.facebook || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a 
                href={SCHOOL_INFO.socialMedia?.twitter || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
                whileHover={{ scale: 1.2, rotate: -10 }}
              >
                <Twitter size={20} />
              </motion.a>
              <motion.a 
                href={SCHOOL_INFO.socialMedia?.instagram || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                <Instagram size={20} />
              </motion.a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/admission-enquiry" className="text-muted-foreground hover:text-primary transition-colors">
                  Admissions
                </Link>
              </li>
              <li>
                <Link to="/academics" className="text-muted-foreground hover:text-primary transition-colors">
                  Academics
                </Link>
              </li>
              <li>
                <Link to="/facilities" className="text-muted-foreground hover:text-primary transition-colors">
                  Facilities
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-muted-foreground hover:text-primary transition-colors">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <MapPin size={16} className="mr-2 text-primary" />
                <span className="text-muted-foreground">{SCHOOL_INFO.address}</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-primary" />
                <span className="text-muted-foreground">{SCHOOL_INFO.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2 text-primary" />
                <span className="text-muted-foreground">{SCHOOL_INFO.email}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-muted pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {SCHOOL_INFO.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}