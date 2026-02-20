import { motion, useInView } from "framer-motion";
import { achievements } from "@/data/home/achievements";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { Trophy } from "lucide-react";

function Counter({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

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
      {count}{hasPlus ? '+' : ''}{hasPercent ? '%' : ''}
    </span>
  );
}

const cardStyles = [
  { gradient: "from-violet-500 to-indigo-600", bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-600", shadow: "shadow-violet-100/50" },
  { gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600", shadow: "shadow-amber-100/50" },
  { gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600", shadow: "shadow-emerald-100/50" },
  { gradient: "from-pink-500 to-rose-500", bg: "bg-pink-50", border: "border-pink-100", text: "text-pink-600", shadow: "shadow-pink-100/50" },
];

export function AchievementsSection() {
  return (
    <section className="relative py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-sm font-semibold mb-4">
            <Trophy className="w-4 h-4" />
            Our Achievements
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
            Numbers That{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Speak
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {achievements.map((achievement, index) => {
            const style = cardStyles[index % cardStyles.length];
            return (
              <motion.div
                key={achievement.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group"
              >
                <div className={cn(
                  "relative p-6 md:p-8 rounded-2xl text-center",
                  "bg-white border",
                  style.border,
                  "shadow-sm hover:shadow-lg",
                  style.shadow,
                  "transition-all duration-300"
                )}>
                  {/* Accent dot */}
                  <div className={cn(
                    "mx-auto w-2 h-2 rounded-full mb-4 bg-gradient-to-r",
                    style.gradient
                  )} />

                  {/* Number */}
                  <div className={cn(
                    "text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-br bg-clip-text text-transparent mb-3",
                    style.gradient
                  )}>
                    <Counter value={achievement.number} />
                  </div>

                  {/* Underline */}
                  <div className={cn(
                    "w-10 h-0.5 mx-auto rounded-full bg-gradient-to-r mb-3",
                    style.gradient
                  )} />

                  {/* Label */}
                  <div className="text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    {achievement.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
