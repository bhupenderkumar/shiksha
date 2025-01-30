import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function MobileFloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show CTA when scrolling up or when near the bottom of the page
      const isNearBottom = 
        window.innerHeight + window.scrollY >= 
        document.documentElement.scrollHeight - 100;
      
      if (currentScrollY < lastScrollY || isNearBottom) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Show initially
    setIsVisible(true);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
        >
          <Button 
            asChild 
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 shadow-lg"
          >
            <Link to="/admission-enquiry" className="flex items-center justify-center">
              Start Admission Process
              <ArrowRight className="ml-2 h-4 w-4 animate-pulse" />
            </Link>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}