import { motion } from "framer-motion";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowUp } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { useTheme } from "@/lib/theme-provider";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";

interface PlaygroundFooterProps {
  className?: string;
}

export function PlaygroundFooter({ className = "" }: PlaygroundFooterProps) {
  const { theme } = useTheme();

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



  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className={`relative pt-32 pb-8 overflow-hidden ${className}`}>
      {/* Footer Background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-0 bg-gradient-to-t from-primary/10 to-transparent"
      />

      {/* Decorative elements */}
      <div className="absolute bottom-32 left-0 right-0 z-10 flex justify-center space-x-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassmorphicCard
            className="p-4"
            intensity="medium"
            borderGlow={true}
            animated={true}
          >
            <div className="text-center text-primary font-bold">Learn</div>
          </GlassmorphicCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassmorphicCard
            className="p-4"
            intensity="medium"
            borderGlow={true}
            animated={true}
          >
            <div className="text-center text-primary font-bold">Play</div>
          </GlassmorphicCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassmorphicCard
            className="p-4"
            intensity="medium"
            borderGlow={true}
            animated={true}
          >
            <div className="text-center text-primary font-bold">Grow</div>
          </GlassmorphicCard>
        </motion.div>
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
                <FaFacebook size={20} />
              </motion.a>
              <motion.a
                href={SCHOOL_INFO.socialMedia?.twitter || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
                whileHover={{ scale: 1.2, rotate: -10 }}
              >
                <FaTwitter size={20} />
              </motion.a>
              <motion.a
                href={SCHOOL_INFO.socialMedia?.instagram || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                <FaInstagram size={20} />
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