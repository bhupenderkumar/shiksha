import { motion, useMotionValue, useTransform } from "framer-motion";
import { Sun, Moon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedText } from "@/components/ui/animated-text";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/theme-provider";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import { LightingContainer, LightingEffect } from "@/components/ui/lighting-effect";

import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { useEffect, useState } from "react";

export function HeroSection() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse position tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Interactive light effect that follows mouse
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    mouseX.set(mousePosition.x);
    mouseY.set(mousePosition.y);
  }, [mousePosition, mouseX, mouseY]);

  return (
    <LightingContainer>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background backdrop-blur-sm">
        {/* Subtle lighting effects */}
        <LightingEffect
          variant="glow"
          color="primary"
          size="xl"
          position="top"
          className="opacity-30"
        />
        <LightingEffect
          variant="beam"
          color="accent"
          size="lg"
          position="right"
          className="opacity-20"
        />

        {/* Mouse-following light effect */}
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl pointer-events-none mix-blend-soft-light"
          style={{
            x: useTransform(mouseX, value => value - 150),
            y: useTransform(mouseY, value => value - 150)
          }}
        />

        {/* Theme toggle button with glassmorphic effect */}
        <div className="absolute top-4 right-4 z-20">
          <GlassmorphicCard className="p-1" intensity="low">
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
          </GlassmorphicCard>
        </div>

        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-white/5 dark:bg-black/10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${isDark ? 'rgba(136, 192, 208, 0.1)' : 'rgba(255, 155, 113, 0.1)'} 0%, transparent 8%)`
          }} />
        </div>

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
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className={`w-40 h-16 rounded-full ${isDark ? "bg-gray-700" : "bg-white"}`}></div>
        </motion.div>

        <motion.div
          className="absolute top-20 right-20 opacity-60"
          animate={{ x: [0, -10, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
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
                className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
                variant="slideUp"
              />
              <GlassmorphicCard className="inline-block px-4 py-1 mt-2" intensity="low" animated={true} shimmer={true}>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-muted-foreground"
                >
                  Established {SCHOOL_INFO.establishedYear}
                </motion.p>
              </GlassmorphicCard>
            </div>

            {/* Tagline with glassmorphic effect */}
            <div className="relative">
              <GlassmorphicCard className="p-6" intensity="medium" animated={true} borderGlow={true}>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-foreground/90 leading-relaxed"
                >
                  Nurturing young minds, building bright futures. Join us in our journey of excellence in education.
                </motion.p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-primary/60 via-accent/60 to-secondary/60 rounded-full"
                />
              </GlassmorphicCard>
            </div>

            {/* Quick stats with glassmorphic cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {[
                { label: "Students", value: "400+" },
                { label: "Teachers", value: "10+" },
                { label: "Success Rate", value: "95%" },
                { label: "Activities", value: "20+" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <GlassmorphicCard
                    className="p-4 text-center"
                    intensity="medium"
                    borderGlow={true}
                    animated={true}
                    shimmer={true}
                  >
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </GlassmorphicCard>
                </motion.div>
              ))}
            </motion.div>

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
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                <Link to="/login">
                  Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <GlassmorphicCard className="overflow-hidden" borderGlow={true} animated={true} shimmer={true}>
                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="bg-transparent hover:bg-transparent"
                >
                  <Link to="/register">
                    Signup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </GlassmorphicCard>
            </motion.div>

            {/* Admission button with special effect */}
            <GlassmorphicCard
              className="overflow-hidden inline-block"
              intensity="high"
              borderGlow={true}
              animated={true}
              shimmer={true}
              hoverEffect={true}
            >
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="relative overflow-hidden group bg-transparent hover:bg-transparent"
              >
                <Link to="/admission-enquiry">
                  <span className="relative z-10">Start Admission Process</span>
                  <ArrowRight className="ml-2 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
            </GlassmorphicCard>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-[100px]">
          <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-primary/5 to-transparent" />
        </div>
      </section>
    </LightingContainer>
  );
}