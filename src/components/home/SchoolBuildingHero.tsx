import { motion } from "framer-motion";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/ui/light-effects";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/theme-provider";
import { StudentCharacter } from "@/components/animations/characters/StudentCharacter";
import { TeacherCharacter } from "@/components/animations/characters/TeacherCharacter";
import { SchoolBuilding } from "@/components/animations/school-elements/SchoolBuilding";

interface SchoolBuildingHeroProps {
  className?: string;
}

export function SchoolBuildingHero({ className = "" }: SchoolBuildingHeroProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Animation variants
  const heroTextAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cloudAnimation = {
    animate: {
      x: [0, 10, 0],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className={`relative py-20 overflow-hidden ${className}`}>
      {/* Sky background with day/night effect */}
      <div 
        className={`absolute inset-0 transition-colors duration-1000 ${
          isDark 
            ? "bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950" 
            : "bg-gradient-to-b from-blue-200 via-blue-100 to-white"
        }`}
      />
      
      {/* Clouds */}
      <motion.div
        className="absolute top-10 left-10 opacity-70"
        variants={cloudAnimation}
        animate="animate"
      >
        <div className={`w-40 h-16 rounded-full ${isDark ? "bg-gray-700" : "bg-white"}`}></div>
      </motion.div>
      
      <motion.div
        className="absolute top-20 right-20 opacity-60"
        variants={cloudAnimation}
        animate="animate"
        transition={{ delay: 0.5 }}
      >
        <div className={`w-32 h-12 rounded-full ${isDark ? "bg-gray-800" : "bg-white"}`}></div>
      </motion.div>

      {/* Sun/Moon */}
      <motion.div
        className="absolute top-16 right-16"
        initial={{ scale: 0.8 }}
        animate={{ 
          scale: [0.8, 1, 0.8],
          transition: { duration: 8, repeat: Infinity }
        }}
      >
        <div 
          className={`w-20 h-20 rounded-full ${
            isDark 
              ? "bg-gray-300 shadow-[0_0_40px_10px_rgba(255,255,255,0.2)]" 
              : "bg-yellow-300 shadow-[0_0_60px_20px_rgba(255,255,100,0.3)]"
          }`}
        />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-12">
          <motion.div
            variants={heroTextAnimation}
            initial="hidden"
            animate="visible"
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

        {/* School Building Scene */}
        <div className="relative h-[400px] md:h-[500px] w-full">
          {/* School Building */}
          <SchoolBuilding className="absolute bottom-0 left-1/2 transform -translate-x-1/2" />
          
          {/* Student Characters */}
          <StudentCharacter 
            className="absolute bottom-10 left-[15%]" 
            direction="right"
            variant="walking"
          />
          <StudentCharacter 
            className="absolute bottom-10 right-[20%]" 
            direction="left"
            variant="jumping"
            delay={0.5}
          />
          
          {/* Teacher Character */}
          <TeacherCharacter 
            className="absolute bottom-10 left-[30%]" 
            direction="right"
          />
        </div>
      </div>
    </section>
  );
}