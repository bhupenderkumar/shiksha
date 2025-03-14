import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedText } from "@/components/ui/animated-text";
import { Star, Users } from "lucide-react";
import { StudentCharacter } from "@/components/animations/characters/StudentCharacter";
import { TeacherCharacter } from "@/components/animations/characters/TeacherCharacter";
import { useTheme } from "@/lib/theme-provider";

interface Testimonial {
  name: string;
  role: string;
  rating: number;
  text: string;
  photo?: string;
}

interface SchoolAssemblyProps {
  testimonials: Testimonial[];
  className?: string;
}

export function SchoolAssembly({ testimonials, className = "" }: SchoolAssemblyProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Animation variants
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const speechBubbleAnimation = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Assembly hall elements
  const assemblyHallElements = {
    stage: isDark ? "#4c566a" : "#dee2e6",
    curtains: isDark ? "#bf616a" : "#fa5252",
    floor: isDark ? "#2e3440" : "#f8f9fa",
    wall: isDark ? "#3b4252" : "#f1f3f5",
  };

  return (
    <section className={`py-24 ${isDark ? "bg-gradient-to-b from-blue-950/30 to-gray-900/50" : "bg-gradient-to-b from-primary/5 to-background"} ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <AnimatedText
            text="What Parents Say"
            className="text-3xl font-bold mb-4"
            variant="slideUp"
          />
          <p className="text-muted-foreground">Hear from our school community</p>
        </div>

        {/* Assembly Hall Background */}
        <div className="relative mb-12">
          {/* Stage */}
          <div 
            className="h-8 w-full rounded-t-lg"
            style={{ background: assemblyHallElements.stage }}
          />
          
          {/* Curtains */}
          <div className="flex justify-between">
            <div 
              className="w-1/4 h-16"
              style={{ 
                background: assemblyHallElements.curtains,
                borderRadius: "0 0 50% 0"
              }}
            />
            <div 
              className="w-1/4 h-16"
              style={{ 
                background: assemblyHallElements.curtains,
                borderRadius: "0 0 0 50%"
              }}
            />
          </div>
          
          {/* Teacher on stage */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
            <TeacherCharacter variant="pointing" />
          </div>
        </div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemAnimation}
              className="relative"
            >
              {/* Student Character */}
              <div className="absolute -bottom-4 left-4 z-10 transform scale-75">
                <StudentCharacter 
                  direction={index % 2 === 0 ? "right" : "left"}
                  variant="standing"
                  delay={index * 0.2}
                />
              </div>

              {/* Speech Bubble Card */}
              <motion.div variants={speechBubbleAnimation}>
                <Card className="h-full relative speech-bubble" style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 mr-3 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating ? 'fill-current' : 'fill-none'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{testimonial.text}</p>
                  </CardContent>
                  
                  {/* Speech bubble pointer */}
                  <div 
                    className="absolute -bottom-4 left-8 w-8 h-8 rotate-45"
                    style={{ background: isDark ? "#2e3440" : "#ffffff" }}
                  />
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}