import { motion } from "framer-motion";
import { features } from "@/data/home/features";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function FeaturesSection() {
  const cardColors = [
    { border: "border-violet-100", hoverBorder: "hover:border-violet-200", iconBg: "bg-gradient-to-br from-violet-500 to-indigo-600", shadow: "hover:shadow-violet-100/50", accent: "text-violet-600" },
    { border: "border-pink-100", hoverBorder: "hover:border-pink-200", iconBg: "bg-gradient-to-br from-pink-500 to-rose-600", shadow: "hover:shadow-pink-100/50", accent: "text-pink-600" },
    { border: "border-amber-100", hoverBorder: "hover:border-amber-200", iconBg: "bg-gradient-to-br from-amber-500 to-orange-600", shadow: "hover:shadow-amber-100/50", accent: "text-amber-600" },
    { border: "border-emerald-100", hoverBorder: "hover:border-emerald-200", iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600", shadow: "hover:shadow-emerald-100/50", accent: "text-emerald-600" },
    { border: "border-blue-100", hoverBorder: "hover:border-blue-200", iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600", shadow: "hover:shadow-blue-100/50", accent: "text-blue-600" },
  ];

  return (
    <section id="features" className="relative py-20 bg-slate-50/50 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Why Parents Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Excellence in{" "}
            <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              Every Aspect
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A holistic approach to education that nurtures creativity, curiosity, and character
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const colors = cardColors[index % cardColors.length];
            const CardInner = (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={cn(
                  "group relative h-full p-6 rounded-2xl",
                  "bg-white border",
                  colors.border,
                  colors.hoverBorder,
                  "shadow-sm hover:shadow-lg",
                  colors.shadow,
                  "transition-all duration-300 hover:-translate-y-1",
                  "cursor-pointer"
                )}
              >
                {/* Top accent line */}
                <div className={cn(
                  "absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                  colors.iconBg
                )} />

                {/* Icon */}
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5",
                  colors.iconBg
                )}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Link arrow */}
                {feature.link && (
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-sm font-medium", colors.accent)}>
                      Learn more
                    </span>
                    <ArrowUpRight className={cn("w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform", colors.accent)} />
                  </div>
                )}
              </motion.div>
            );

            return feature.link ? (
              <Link key={index} to={feature.link}>
                {CardInner}
              </Link>
            ) : (
              <div key={index}>
                {CardInner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
