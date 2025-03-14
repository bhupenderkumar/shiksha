import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedText } from "@/components/ui/animated-text";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LightingContainer, LightingEffect } from "@/components/ui/lighting-effect";
import { cn } from "@/lib/utils";
import { StudentCharacter } from "@/components/animations/characters/StudentCharacter";
import { useTheme } from "@/lib/theme-provider";

const steps = [
  {
    number: 1,
    title: "Submit Enquiry",
    description: "Fill out the admission enquiry form with required details",
  },
  {
    number: 2,
    title: "Document Submission",
    description: "Submit required documents for verification",
  },
  {
    number: 3,
    title: "Interview",
    description: "Schedule and attend admission interview",
  },
  {
    number: 4,
    title: "Admission Confirmation",
    description: "Receive confirmation and join our school family",
  },
];

export function AdmissionProcess() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <LightingContainer>
      <section className="relative py-16 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden">
        {/* Lighting effects */}
        <LightingEffect 
          variant="glow"
          color="primary"
          size="xl"
          position="center"
          className="opacity-20"
        />
        <LightingEffect 
          variant="beam"
          color="secondary"
          size="lg"
          position="top"
          className="opacity-10"
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <AnimatedText
              text="Admission Process"
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
              variant="slideUp"
            />
            <p className="text-lg text-muted-foreground">
              Simple steps to join our school family
            </p>
          </div>

          {/* Journey Path with Student Character */}
          <div className="relative mb-16">
            {/* Path Line */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 h-[300px] w-4 rounded-full"
              style={{ background: isDark ? "#4c566a" : "#dee2e6" }}
            />

            {/* Animated Path Highlight */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 w-4 rounded-full"
              style={{ 
                background: isDark ? "#88c0d0" : "#74c0fc", 
                height: 0 
              }}
              animate={{ height: "300px" }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />

            {/* Student Character walking up the path */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2"
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              transition={{ duration: 5, ease: "easeInOut" }}
            >
              <StudentCharacter variant="walking" direction="right" />
            </motion.div>
          </div>

          {/* Steps with connecting lines */}
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 hidden md:block" />
            
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.2,
                    duration: 0.5
                  }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="text-center relative group"
                >
                  {/* Step number circle with animated border */}
                  <div className="relative mx-auto mb-6 w-24 h-24">
                    <div className={cn(
                      "absolute inset-0 rounded-full",
                      "bg-gradient-to-r from-primary to-purple-600",
                      "opacity-20 group-hover:opacity-100",
                      "transition-opacity duration-500",
                      "animate-pulse",
                      "shadow-lg"
                    )} />
                    <motion.div
                      className={cn(
                        "relative w-full h-full rounded-full",
                        "bg-white/90 backdrop-blur-sm",
                        "border-4 border-primary/50",
                        "flex items-center justify-center",
                        "group-hover:scale-110",
                        "transition-transform duration-500",
                        "shadow-inner",
                        "transform-gpu"
                      )}
                      whileHover={{
                        rotate: 360,
                        scale: 1.2,
                        borderWidth: '6px'
                      }}
                      transition={{
                        duration: 0.8,
                        type: "spring",
                        bounce: 0.5
                      }}
                    >
                      <span className="text-3xl font-black text-primary drop-shadow-sm">
                        {step.number}
                      </span>
                    </motion.div>
                  </div>

                  {/* Step content with hover effect */}
                  <div className="group-hover:transform group-hover:-translate-y-2 transition-all duration-300">
                    <h3 className={cn(
                      "text-xl font-black mb-3",
                      "bg-gradient-to-r from-primary to-purple-600",
                      "bg-clip-text text-transparent",
                      "group-hover:scale-105 transform transition-transform",
                      "drop-shadow-sm"
                    )}>
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA button with enhanced effects */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            <Button 
              size="lg" 
              asChild 
              className={cn(
                "relative overflow-hidden group",
                "bg-gradient-to-r from-primary to-purple-600",
                "hover:scale-105 transition-transform duration-300"
              )}
            >
              <Link to="/admission-enquiry">
                <span className="relative z-10">Start Your Journey Today</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </LightingContainer>
  );
}