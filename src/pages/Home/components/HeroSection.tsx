import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Star, ChevronDown, Sparkles, GraduationCap, BookOpen, Palette, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import { useRef, useEffect, useState } from "react";

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

function FloatingShape({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-10, 10, -10],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const stats = [
    { value: 400, suffix: "+", label: "Happy Students", icon: "🎓", color: "from-violet-500 to-purple-500" },
    { value: 15, suffix: "+", label: "Years Legacy", icon: "⭐", color: "from-amber-500 to-orange-500" },
    { value: 95, suffix: "%", label: "Success Rate", icon: "🏆", color: "from-emerald-500 to-teal-500" },
    { value: 10, suffix: "+", label: "Expert Faculty", icon: "👩‍🏫", color: "from-pink-500 to-rose-500" },
  ];

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-violet-50/80 via-white to-white"
    >
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingShape
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-violet-200/40 to-indigo-200/30 blur-3xl"
          delay={0}
        />
        <FloatingShape
          className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-amber-100/50 to-orange-100/30 blur-3xl"
          delay={2}
        />
        <FloatingShape
          className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-pink-100/40 to-rose-100/20 blur-3xl"
          delay={4}
        />

        {/* Floating icons */}
        <motion.div
          className="absolute top-32 right-[15%] hidden md:block"
          animate={{ y: [-8, 8, -8], rotate: [-10, 10, -10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-12 h-12 rounded-2xl bg-white shadow-lg shadow-violet-100 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-violet-500" />
          </div>
        </motion.div>
        <motion.div
          className="absolute top-48 left-[10%] hidden md:block"
          animate={{ y: [8, -8, 8], rotate: [5, -5, 5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <div className="w-10 h-10 rounded-xl bg-white shadow-lg shadow-amber-100 flex items-center justify-center">
            <Palette className="w-5 h-5 text-amber-500" />
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-[8%] hidden lg:block"
          animate={{ y: [-6, 6, -6], rotate: [-8, 8, -8] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <div className="w-11 h-11 rounded-xl bg-white shadow-lg shadow-emerald-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-500" />
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-52 right-[12%] hidden lg:block"
          animate={{ y: [5, -5, 5], rotate: [10, -10, 10] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          <div className="w-10 h-10 rounded-xl bg-white shadow-lg shadow-pink-100 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-pink-500" />
          </div>
        </motion.div>

        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 container mx-auto px-4 pt-28 md:pt-36 pb-16"
        style={{ opacity }}
      >
        <div className="text-center max-w-4xl mx-auto">
          {/* Tagline badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-xs sm:text-sm font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Ranked #1 in Saurabh Vihar for Quality Education
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6"
          >
            <span className="block">Where</span>
            <span className="block mt-1">
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Dreams
              </span>{" "}
              Take{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  First Steps
                </span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                />
              </span>
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed px-2"
          >
            At <span className="text-violet-600 font-semibold">{SCHOOL_INFO.name}</span>, we
            nurture curious minds into confident leaders through{" "}
            <span className="text-emerald-600 font-medium">innovative teaching</span> and{" "}
            <span className="text-pink-600 font-medium">personalized attention</span>.
          </motion.p>

          {/* Quick action pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="flex flex-wrap justify-center gap-2 mb-8 px-2"
          >
            <Link
              to="/fee-structure"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs sm:text-sm font-medium hover:bg-amber-100 hover:border-amber-300 transition-all duration-200 hover:scale-[1.03]"
            >
              💰 Fee Structure
            </Link>
            <Link
              to="/parent-feedback-search"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200 hover:scale-[1.03]"
            >
              📋 View Feedback
            </Link>
            <Link
              to="/final-date-sheet"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-medium hover:bg-red-100 hover:border-red-300 transition-all duration-200 hover:scale-[1.03]"
            >
              📝 Final Exam Date Sheet
            </Link>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mb-16 px-4"
          >
            <Link
              to="/admission-enquiry"
              className="group w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 text-sm sm:text-base rounded-2xl shadow-xl shadow-violet-200 hover:shadow-violet-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <GraduationCap className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Start Admission
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="group w-full sm:w-auto inline-flex items-center justify-center border-2 border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50 font-semibold px-8 py-4 text-sm sm:text-base rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="mr-2 h-4 w-4 fill-current group-hover:text-violet-600 transition-colors" />
              Portal Login
            </Link>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto px-2"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative"
              >
                <div className="relative p-4 md:p-5 rounded-2xl bg-white border border-slate-100 shadow-md shadow-slate-100/50 hover:shadow-lg hover:shadow-violet-100/30 hover:border-violet-100 transition-all duration-300">
                  <motion.span
                    className="absolute -top-2 -right-1 text-lg"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {stat.icon}
                  </motion.span>
                  <div className={`text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-400 mt-1 font-medium">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center text-slate-300 cursor-pointer hover:text-violet-400 transition-colors"
        >
          <span className="text-[9px] mb-1 tracking-[0.15em] uppercase font-medium">
            Scroll
          </span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
    </section>
  );
}
