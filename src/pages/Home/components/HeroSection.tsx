import { motion } from "framer-motion";
import { Rocket, Sun, Moon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedText } from "@/components/ui/animated-text";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/theme-provider";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import { LightingContainer, LightingEffect } from "@/components/ui/lighting-effect";
import { animations } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { StudentCharacter } from "@/components/animations/characters/StudentCharacter";
import { TeacherCharacter } from "@/components/animations/characters/TeacherCharacter";
import { SchoolBuilding } from "@/components/animations/school-elements/SchoolBuilding";

export function HeroSection() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  // Cloud animation
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
    <LightingContainer>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        {/* Dynamic lighting effects */}
        <LightingEffect 
          variant="glow"
          color="primary"
          size="xl"
          position="top"
          className="opacity-40"
        />
        <LightingEffect 
          variant="beam"
          color="accent"
          size="lg"
          position="right"
          className="opacity-30"
        />
        <LightingEffect 
          variant="shimmer"
          color="secondary"
          size="xl"
          position="left"
          className="opacity-20"
        />

        {/* Theme toggle button */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full hover:bg-primary/10 transition-colors"
          >
            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-pattern dark:opacity-20" />

        {/* Sky background with day/night effect */}
        <div 
          className={`absolute inset-0 transition-colors duration-1000 ${
            isDark 
              ? "bg-gradient-to-b from-blue-950 via-indigo-950 to-purple-950" 
              : "bg-gradient-to-b from-blue-200 via-blue-100 to-white"
          }`}
          style={{ zIndex: -1 }}
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

        {/* Main content */}
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* School name and established year */}
            <div className="space-y-2">
              <AnimatedText
                text={SCHOOL_INFO.name}
                className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
                variant="slideUp"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground"
              >
                Established {SCHOOL_INFO.establishedYear}
              </motion.p>
            </div>

            {/* Tagline with gradient underline */}
            <div className="relative">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                Nurturing young minds, building bright futures. Join us in our journey of excellence in education.
              </motion.p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-gradient-to-r from-primary/40 via-purple-500/40 to-transparent"
              />
            </div>

            {/* Action buttons with enhanced hover effects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button 
                size="lg" 
                asChild
                className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
              >
                <Link to="/login">
                  Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="hover:bg-primary/10 transition-colors"
              >
                <Link to="/register">
                  Signup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Admission button with special effect */}
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="relative overflow-hidden group hover:border-primary/50 transition-colors"
            >
              <Link to="/admission-enquiry">
                <span className="relative z-10">Start Admission Process</span>
                <ArrowRight className="ml-2 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </Button>
          </div>
        </div>

        {/* School Building Scene */}
        <div className="absolute bottom-0 left-0 right-0 h-[300px] md:h-[400px]">
          {/* School Building */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <SchoolBuilding />
          </div>
          
          {/* Student Characters */}
          <div className="absolute bottom-10 left-[15%]">
            <StudentCharacter 
              direction="right"
              variant="walking"
            />
          </div>
          <div className="absolute bottom-10 right-[20%]">
            <StudentCharacter 
              direction="left"
              variant="jumping"
              delay={0.5}
            />
          </div>
          
          {/* Teacher Character */}
          <div className="absolute bottom-10 left-[30%]">
            <TeacherCharacter 
              direction="right"
            />
          </div>
        </div>
      </section>
    </LightingContainer>
  );
}