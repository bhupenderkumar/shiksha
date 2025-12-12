import { motion, useInView } from "framer-motion";
import { achievements } from "@/data/home/achievements";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { Trophy } from "lucide-react";

// Animated counter
function Counter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  // Extract number from value like "400+", "95%", etc.
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
  const hasPlus = value.includes('+');
  const hasPercent = value.includes('%');
  
  useEffect(() => {
    if (!isInView) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [isInView, numericValue]);
  
  return (
    <span ref={ref}>
      {count}{hasPlus ? '+' : ''}{hasPercent ? '%' : ''}{suffix}
    </span>
  );
}

export function AchievementsSection() {
  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Horizontal line decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
            <Trophy className="w-4 h-4" />
            Our Achievements
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            Numbers That{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Speak
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className={cn(
                "relative p-8 md:p-10 rounded-3xl text-center",
                "bg-zinc-900/80 border border-zinc-800",
                "hover:border-zinc-700 transition-all duration-500",
                "overflow-hidden"
              )}>
                {/* Gradient glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10" />
                </div>
                
                {/* Number */}
                <div className="relative">
                  <div className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-br from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent mb-4">
                    <Counter value={achievement.number} />
                  </div>
                  
                  {/* Underline */}
                  <div className="w-12 h-1 mx-auto rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mb-4" />
                  
                  {/* Label */}
                  <div className="text-sm md:text-base font-medium text-zinc-400 uppercase tracking-wider">
                    {achievement.label}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}