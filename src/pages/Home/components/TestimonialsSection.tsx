import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedText } from "@/components/ui/animated-text";
import { Users, Star, Globe, Image as ImageIcon, Loader2 } from "lucide-react";
import { testimonials } from "@/data/home/testimonials";
import { LightingContainer, LightingEffect } from "@/components/ui/lighting-effect";
import { useGooglePlaceDetails } from "@/hooks/useGooglePlaceDetails";
import { cn } from "@/lib/utils";
import { StudentCharacter } from "@/components/animations/characters/StudentCharacter";
import { TeacherCharacter } from "@/components/animations/characters/TeacherCharacter";
import { useTheme } from "@/lib/theme-provider";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function TestimonialsSection() {
  const { isLoading, error, placeDetails, photoUrls } = useGooglePlaceDetails();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Assembly hall elements
  const assemblyHallElements = {
    stage: isDark ? "#4c566a" : "#dee2e6",
    curtains: isDark ? "#bf616a" : "#fa5252",
    floor: isDark ? "#2e3440" : "#f8f9fa",
    wall: isDark ? "#3b4252" : "#f1f3f5",
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
          {/* Parent Testimonials Section */}
          <div className="text-center mb-16">
            <AnimatedText
              text="What Parents Say"
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
              variant="slideUp"
            />
            <p className="text-lg text-muted-foreground">Hear from our school community</p>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
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
                <motion.div variants={speechBubbleAnimation} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <Card className="h-full relative overflow-hidden" style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        {testimonial.photo ? (
                          <Avatar className="h-10 w-10 mr-3 border-2 border-primary/20">
                            <AvatarImage src={testimonial.photo} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 mr-3 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            {testimonial.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-500 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < testimonial.rating ? "fill-current" : "fill-none"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {testimonial.text}
                      </p>
                    </CardContent>
                    
                    {/* Speech bubble pointer */}
                    <div
                      className="absolute -bottom-4 left-8 w-8 h-8 rotate-45"
                      style={{ background: isDark ? "#2e3440" : "#ffffff" }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Google Reviews Section */}
          <div className="mt-32 mb-16">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Globe className="h-8 w-8 text-[#4285F4]" />
                <AnimatedText
                  text="Google Reviews"
                  className="text-4xl font-bold bg-gradient-to-r from-[#4285F4] via-[#DB4437] to-[#F4B400] bg-clip-text text-transparent"
                  variant="slideUp"
                />
              </div>
              <p className="text-lg text-muted-foreground">
                What people are saying about us on Google
                {placeDetails && ` (${placeDetails.rating}/5 from ${placeDetails.user_ratings_total} reviews)`}
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                Failed to load Google reviews: {error instanceof Error ? error.message : 'Unknown error'}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {placeDetails?.reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <GlassmorphicCard
                      className="p-6"
                      intensity="medium"
                      borderGlow={true}
                      hoverEffect={true}
                    >
                      <div className="flex items-center mb-4">
                        <Avatar className="h-10 w-10 mr-3 border border-white/20">
                          <AvatarImage src={review.profile_photo_url} alt={review.author_name} />
                          <AvatarFallback>{review.author_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{review.author_name}</p>
                          <p className="text-xs text-muted-foreground">{review.relative_time_description}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-500 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < review.rating ? "fill-current" : "fill-none"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                        {review.text}
                      </p>
                      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 text-[#4285F4] mr-1" />
                          <span className="text-xs text-muted-foreground">Google Review</span>
                        </div>
                        <motion.button
                          className="text-xs text-primary hover:underline"
                          whileHover={{ scale: 1.05 }}
                        >
                          Read more
                        </motion.button>
                      </div>
                    </GlassmorphicCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Google Photos Section */}
          <div className="mt-32 mb-16">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <ImageIcon className="h-8 w-8 text-[#4285F4]" />
                <AnimatedText
                  text="School Photos"
                  className="text-4xl font-bold bg-gradient-to-r from-[#4285F4] via-[#DB4437] to-[#F4B400] bg-clip-text text-transparent"
                  variant="slideUp"
                />
              </div>
              <p className="text-lg text-muted-foreground">Photos from our Google Business Profile</p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                Failed to load Google photos: {error instanceof Error ? error.message : 'Unknown error'}
              </div>
            ) : photoUrls.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No photos available from Google
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photoUrls.map((photoUrl, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                  >
                    <GlassmorphicCard
                      className="overflow-hidden p-0"
                      intensity="medium"
                      borderGlow={true}
                    >
                      <AspectRatio ratio={4/3}>
                        <img
                          src={photoUrl}
                          alt={`School photo ${index + 1}`}
                          className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
                        />
                      </AspectRatio>
                    </GlassmorphicCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </LightingContainer>
  );
}