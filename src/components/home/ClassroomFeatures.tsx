import { motion } from "framer-motion";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import { Card, CardContent } from "@/components/ui/card";
import { GradientText } from "@/components/ui/light-effects";
import { TeacherCharacter } from "@/components/animations/characters/TeacherCharacter";
import { useTheme } from "@/lib/theme-provider";
import { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  link?: string;
}

interface ClassroomFeaturesProps {
  features: Feature[];
  className?: string;
}

export function ClassroomFeatures({ features, className = "" }: ClassroomFeaturesProps) {
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

  const classroomElements = {
    whiteboard: isDark ? "#d8dee9" : "#f8f9fa",
    desk: isDark ? "#4c566a" : "#adb5bd",
    floor: isDark ? "#2e3440" : "#e9ecef",
    wall: isDark ? "#3b4252" : "#f1f3f5",
  };

  return (
    <section className={`py-20 ${isDark ? "bg-gray-900/50" : "bg-muted/50"} ${className}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Choose <GradientText>{SCHOOL_INFO.name}</GradientText>
        </h2>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemAnimation}
              className="relative"
            >
              <Card className="hover-lift h-full overflow-hidden">
                {/* Classroom background */}
                <div 
                  className="absolute inset-0 z-0" 
                  style={{ 
                    background: classroomElements.wall,
                    borderBottom: `15px solid ${classroomElements.floor}`
                  }}
                />
                
                {/* Whiteboard */}
                <div 
                  className="absolute top-4 left-1/2 transform -translate-x-1/2 z-0"
                  style={{
                    width: "80%",
                    height: "40px",
                    background: classroomElements.whiteboard,
                    border: `2px solid ${isDark ? "#4c566a" : "#ced4da"}`,
                  }}
                >
                  <div className="text-center text-xs font-bold pt-2">
                    {feature.title}
                  </div>
                </div>
                
                {/* Teacher character */}
                <div className="absolute bottom-4 right-4 z-0">
                  <TeacherCharacter 
                    variant="pointing" 
                    direction={index % 2 === 0 ? "right" : "left"}
                    delay={index * 0.2}
                  />
                </div>

                <CardContent className="p-6 relative z-10 bg-opacity-80 backdrop-blur-sm bg-background/80">
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}