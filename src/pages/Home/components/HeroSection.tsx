import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Phone, Mail, MapPin, Star, ChevronDown, Sparkles, Rocket, GraduationCap, Palette, Music, Trophy, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import { useRef, useEffect, useState } from "react";

// Animated counter component
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count}{suffix}</span>;
}

// Floating bubble component
function FloatingBubble({ delay, size, x, color }: { delay: number; size: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ 
        left: `${x}%`, 
        bottom: '-5%',
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${color}, transparent)`,
        opacity: 0.6,
      }}
      animate={{
        y: [0, -800],
        x: [0, Math.sin(delay) * 50],
        scale: [1, 0.8, 0.6],
        opacity: [0, 0.6, 0.4, 0]
      }}
      transition={{
        duration: 8 + delay,
        delay: delay * 0.5,
        repeat: Infinity,
        ease: "easeOut"
      }}
    />
  );
}

// Dancing icon component  
function DancingIcon({ Icon, delay, x, y, color }: { 
  Icon: React.ElementType; 
  delay: number; 
  x: number; 
  y: number; 
  color: string 
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -15, 0, 10, 0],
        rotate: [-5, 5, -5],
        scale: [1, 1.1, 1, 0.95, 1]
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Icon className={`w-6 h-6 md:w-8 md:h-8 ${color}`} style={{ filter: 'drop-shadow(0 0 10px currentColor)' }} />
    </motion.div>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Playful floating bubbles
  const bubbles = [
    { delay: 0, size: 60, x: 5, color: "rgba(168, 85, 247, 0.4)" },
    { delay: 1, size: 80, x: 15, color: "rgba(236, 72, 153, 0.4)" },
    { delay: 2, size: 40, x: 25, color: "rgba(34, 211, 238, 0.4)" },
    { delay: 0.5, size: 70, x: 35, color: "rgba(251, 146, 60, 0.4)" },
    { delay: 1.5, size: 50, x: 55, color: "rgba(74, 222, 128, 0.4)" },
    { delay: 2.5, size: 90, x: 70, color: "rgba(129, 140, 248, 0.4)" },
    { delay: 0.8, size: 45, x: 80, color: "rgba(244, 114, 182, 0.4)" },
    { delay: 1.8, size: 65, x: 92, color: "rgba(96, 165, 250, 0.4)" },
  ];

  // Dancing icons
  const dancingIcons = [
    { Icon: GraduationCap, delay: 0, x: 5, y: 20, color: "text-yellow-400" },
    { Icon: Palette, delay: 0.5, x: 92, y: 25, color: "text-pink-400" },
    { Icon: BookOpen, delay: 1, x: 8, y: 70, color: "text-emerald-400" },
    { Icon: Music, delay: 1.5, x: 88, y: 65, color: "text-cyan-400" },
    { Icon: Trophy, delay: 2, x: 3, y: 45, color: "text-orange-400" },
    { Icon: Sparkles, delay: 2.5, x: 95, y: 45, color: "text-purple-400" },
  ];

  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Animated gradient background - no white elements */}
      <div className="absolute inset-0">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d15] to-[#0a0a0a]" />
        
        {/* Animated colorful mesh gradient */}
        <motion.div 
          className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full"
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.1) 30%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div 
          className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full"
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(236,72,153,0.1) 30%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div 
          className="absolute top-[40%] left-[40%] w-[50%] h-[50%] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 50%)',
            filter: 'blur(50px)',
          }}
        />
        <motion.div 
          className="absolute top-[20%] right-[20%] w-[40%] h-[40%] rounded-full"
          animate={{
            scale: [1.1, 0.9, 1.1],
            x: [0, -40, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{
            background: 'radial-gradient(circle, rgba(251,146,60,0.2) 0%, transparent 50%)',
            filter: 'blur(50px)',
          }}
        />
        
        {/* Subtle animated stars/dots */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.5, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating bubbles */}
      {bubbles.map((bubble, index) => (
        <FloatingBubble key={index} {...bubble} />
      ))}

      {/* Dancing icons */}
      {dancingIcons.map((item, index) => (
        <DancingIcon key={index} {...item} />
      ))}

      {/* Main content */}
      <motion.div 
        className="relative z-10 container mx-auto px-4 pt-4 pb-24"
        style={{ opacity }}
      >
        {/* Top bar with contact info - more compact, minimal */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 md:gap-5 mb-8 text-[11px] md:text-xs text-zinc-500"
        >
          <a href={`tel:${SCHOOL_INFO.phone}`} className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
            <Phone className="w-3 h-3 text-emerald-500" />
            {SCHOOL_INFO.phone}
          </a>
          <a href={`mailto:${SCHOOL_INFO.email}`} className="flex items-center gap-1 hover:text-pink-400 transition-colors">
            <Mail className="w-3 h-3 text-pink-500" />
            <span className="hidden sm:inline">{SCHOOL_INFO.email}</span>
            <span className="sm:hidden">Email</span>
          </a>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-500" />
            <span className="hidden md:inline">{SCHOOL_INFO.address}</span>
            <span className="md:hidden">Saurabh Vihar, Delhi</span>
          </span>
        </motion.div>

        {/* Hero content */}
        <div className="text-center max-w-6xl mx-auto">
          {/* Animated tagline with rainbow effect */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/20 text-amber-300/90 text-xs md:text-sm font-medium backdrop-blur-sm"
              animate={{ 
                borderColor: [
                  "rgba(245,158,11,0.2)", 
                  "rgba(251,146,60,0.3)", 
                  "rgba(245,158,11,0.2)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </motion.span>
              Ranked #1 in Saurabh Vihar for Quality Education
              <motion.span
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-base"
              >
                🏆
              </motion.span>
            </motion.span>
          </motion.div>

          {/* Main heading with wave animation */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
          >
            <div className="overflow-hidden">
              <motion.span 
                className="inline-block text-zinc-100"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Where
              </motion.span>{" "}
              <motion.span 
                className="inline-block bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{ 
                  backgroundSize: '200% 100%',
                  animation: 'gradient-shift 3s ease infinite'
                }}
              >
                Dreams
              </motion.span>
            </div>
            <div className="overflow-hidden mt-1">
              <motion.span 
                className="inline-block text-zinc-100"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Take
              </motion.span>{" "}
              <motion.span 
                className="inline-block bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                style={{ 
                  backgroundSize: '200% 100%',
                  animation: 'gradient-shift 3s ease infinite'
                }}
              >
                First Steps
              </motion.span>
              <motion.span
                className="inline-block ml-1 text-3xl md:text-4xl"
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  y: [0, -5, 0]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                ✨
              </motion.span>
            </div>
          </motion.h1>

          {/* Description - cleaner, more minimal */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-sm md:text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-4"
          >
            At <span className="text-cyan-400 font-medium">{SCHOOL_INFO.name}</span>, we nurture 
            curious minds into confident leaders through{" "}
            <span className="text-emerald-400">innovative teaching</span> and{" "}
            <span className="text-pink-400">personalized attention</span>.
          </motion.p>

          {/* CTA Buttons - cleaner style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mb-14 md:mb-16 px-4"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold px-7 py-5 md:py-6 text-sm md:text-base rounded-full shadow-lg shadow-violet-500/20 transition-all duration-300 group border-0"
              >
                <Link to="/admission-enquiry">
                  <Rocket className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                  Start Admission
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto border border-zinc-700 bg-zinc-900/50 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600 font-semibold px-7 py-5 md:py-6 text-sm md:text-base rounded-full transition-all duration-300 group backdrop-blur-sm"
              >
                <Link to="/login">
                  <Play className="mr-2 h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
                  Portal Login
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats with modern glass cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto px-4"
          >
            {[
              { value: 400, suffix: "+", label: "Happy Students", color: "from-blue-500 to-cyan-400", icon: "😊" },
              { value: 15, suffix: "+", label: "Years Legacy", color: "from-purple-500 to-fuchsia-400", icon: "🎓" },
              { value: 95, suffix: "%", label: "Success Rate", color: "from-orange-500 to-amber-400", icon: "🏅" },
              { value: 10, suffix: "+", label: "Expert Faculty", color: "from-emerald-500 to-teal-400", icon: "👨‍🏫" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="relative group"
              >
                <div className="relative p-4 md:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/50 backdrop-blur-md hover:border-zinc-700/50 transition-all duration-300">
                  <motion.span 
                    className="absolute -top-2 -right-1 text-lg md:text-xl"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {stat.icon}
                  </motion.span>
                  <div className={`text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] md:text-xs text-zinc-500 mt-1 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator - minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors"
        >
          <span className="text-[9px] md:text-[10px] mb-1 tracking-[0.15em] uppercase font-medium">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade - seamless dark */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
    </section>
  );
}