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

export function HeroSection() {
  const { theme, setTheme } = useTheme();

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

        {/* Main content */}
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Rocket icon with float animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20",
                "mx-auto flex items-center justify-center",
                "border-4 border-primary/30",
                "shadow-xl shadow-primary/20",
                "backdrop-blur-lg",
                animations.float
              )}
            >
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <Rocket className="w-16 h-16 text-primary drop-shadow-lg transform -rotate-45" />
                {/* Flame effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full blur-sm"
                />
              </motion.div>
            </motion.div>

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

            {/* Quick stats */}
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
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-3 text-center border border-primary/10"
                >
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground"
            >
              {[
                "Smart Classrooms",
                "Sports Excellence",
                "Cultural Activities"
              ].map((highlight, index) => (
                <motion.span
                  key={highlight}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10"
                >
                  {highlight}
                </motion.span>
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
      </section>
    </LightingContainer>
  );
}