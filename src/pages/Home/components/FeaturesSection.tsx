import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { features } from "@/data/home/features";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function FeaturesSection() {
  // Bento grid layout classes for different positions
  const gridClasses = [
    "md:col-span-2 md:row-span-2", // Large card
    "md:col-span-1 md:row-span-1", // Small card
    "md:col-span-1 md:row-span-1", // Small card
    "md:col-span-1 md:row-span-2", // Tall card
    "md:col-span-2 md:row-span-1", // Wide card
  ];

  const gradients = [
    "from-violet-600 to-indigo-600",
    "from-pink-600 to-rose-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
    "from-blue-600 to-cyan-600",
  ];

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Why Parents Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Excellence in{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              Every Aspect
            </span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            A holistic approach to education that nurtures creativity, curiosity, and character
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[200px]">
          {features.map((feature, index) => {
            const CardContent = (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "group relative h-full rounded-3xl overflow-hidden cursor-pointer",
                  "bg-zinc-900/80 border border-zinc-800",
                  "hover:border-zinc-700 transition-all duration-500",
                  gridClasses[index % gridClasses.length]
                )}
              >
                {/* Gradient background on hover */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  "bg-gradient-to-br",
                  gradients[index % gradients.length]
                )} style={{ opacity: 0.1 }} />
                
                {/* Content */}
                <div className="relative h-full p-8 flex flex-col justify-between">
                  {/* Top section */}
                  <div>
                    {/* Icon */}
                    <div className={cn(
                      "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6",
                      "bg-gradient-to-br",
                      gradients[index % gradients.length]
                    )}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    
                    {/* Description - only visible on larger cards */}
                    <p className={cn(
                      "text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors",
                      index === 0 || index === 3 ? "block" : "hidden md:block"
                    )}>
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Bottom section - arrow indicator */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">
                      {feature.link ? "Learn more" : ""}
                    </span>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      "bg-white/5 group-hover:bg-white/10 transition-colors"
                    )}>
                      <ArrowUpRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                {index === 0 && (
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-3xl" />
                )}
                {index === 3 && (
                  <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent blur-3xl" />
                )}
              </motion.div>
            );

            return feature.link ? (
              <Link key={index} to={feature.link} className={cn(gridClasses[index % gridClasses.length])}>
                {CardContent}
              </Link>
            ) : (
              <div key={index} className={cn(gridClasses[index % gridClasses.length])}>
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}