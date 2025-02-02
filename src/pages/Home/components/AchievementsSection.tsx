import { motion } from "framer-motion";
import { achievements } from "@/data/home/achievements";
import { LightingContainer, LightingEffect } from "@/components/ui/lighting-effect";
import { cn } from "@/lib/utils";

export function AchievementsSection() {
  return (
    <LightingContainer>
      <section className="relative py-12 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden">
        {/* Lighting effects */}
        <LightingEffect
          variant="glow"
          color="secondary"
          size="xl"
          position="center"
          className="opacity-20"
        />
        <LightingEffect
          variant="beam"
          color="primary"
          size="lg"
          position="top"
          className="opacity-10"
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative">
                  <motion.div
                    className={cn(
                      "text-7xl font-black mb-4",
                      "bg-gradient-to-br from-primary via-purple-500 to-pink-500",
                      "bg-clip-text text-transparent",
                      "drop-shadow-md"
                    )}
                    whileHover={{
                      scale: 1.2,
                      rotate: [0, -5, 5, 0],
                      transition: {
                        duration: 0.5,
                        type: "spring",
                        bounce: 0.5
                      }
                    }}
                    animate={{
                      y: [0, -5, 0],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    {achievement.number}
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-lg font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                  {achievement.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </LightingContainer>
  );
}