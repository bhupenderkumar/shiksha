import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { features } from "@/data/home/features";
import { LightingContainer, LightingEffect } from "@/components/ui/lighting-effect";
import { cn } from "@/lib/utils";
import { animations } from "@/lib/animations";
import { TeacherCharacter } from "@/components/animations/characters/TeacherCharacter";
import { useTheme } from "@/lib/theme-provider";

export function FeaturesSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Classroom elements
  const classroomElements = {
    whiteboard: isDark ? "#d8dee9" : "#f8f9fa",
    desk: isDark ? "#4c566a" : "#adb5bd",
    floor: isDark ? "#2e3440" : "#e9ecef",
    wall: isDark ? "#3b4252" : "#f1f3f5",
  };

  return (
    <LightingContainer>
      <section className="relative py-8 bg-gradient-to-b from-gray-50/50 to-background overflow-hidden">
        {/* Lighting effects */}
        <LightingEffect 
          variant="glow"
          color="secondary"
          size="xl"
          position="right"
          className="opacity-30"
        />
        <LightingEffect 
          variant="shimmer"
          color="primary"
          size="lg"
          position="left"
          intensity="low"
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Why Choose Us?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We provide a nurturing environment where every child can thrive and reach their full potential
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                {feature.link ? (
                  <Link to={feature.link}>
                    <Card className={cn(
                      "h-full relative overflow-hidden",
                      "hover:shadow-xl transition-all duration-300",
                      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-purple-500/5",
                      "before:opacity-0 hover:before:opacity-100 before:transition-opacity",
                      "border-2 border-primary/20 hover:border-primary/40",
                      "rounded-2xl transform hover:-translate-y-1",
                      "bg-white/50 backdrop-blur-sm"
                    )}>
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
                      <div className="absolute bottom-4 right-4 z-0 opacity-70 scale-75">
                        <TeacherCharacter 
                          variant="pointing" 
                          direction={index % 2 === 0 ? "right" : "left"}
                          delay={index * 0.2}
                        />
                      </div>

                      <CardContent className="p-8 relative z-10 bg-opacity-80 backdrop-blur-sm bg-background/80">
                        <motion.div
                          className={cn(
                            "w-12 h-12 mb-6 text-primary",
                            "group-hover:scale-110 transition-transform duration-300"
                          )}
                          whileHover={{ rotate: 5 }}
                        >
                          <feature.icon className="w-full h-full" />
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card className={cn(
                    "h-full relative overflow-hidden",
                    "hover:shadow-xl transition-all duration-300",
                    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-purple-500/5",
                    "before:opacity-0 hover:before:opacity-100 before:transition-opacity",
                    "border-2 border-primary/20 hover:border-primary/40",
                    "rounded-2xl transform hover:-translate-y-1",
                    "bg-white/50 backdrop-blur-sm"
                  )}>
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
                    <div className="absolute bottom-4 right-4 z-0 opacity-70 scale-75">
                      <TeacherCharacter 
                        variant="pointing" 
                        direction={index % 2 === 0 ? "right" : "left"}
                        delay={index * 0.2}
                      />
                    </div>

                    <CardContent className="p-8 relative z-10 bg-opacity-80 backdrop-blur-sm bg-background/80">
                      <motion.div
                        className={cn(
                          "w-12 h-12 mb-6 text-primary",
                          "group-hover:scale-110 transition-transform duration-300"
                        )}
                        whileHover={{ rotate: 5 }}
                      >
                        <feature.icon className="w-full h-full" />
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </LightingContainer>
  );
}