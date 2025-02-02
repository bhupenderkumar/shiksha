import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedText } from "@/components/ui/animated-text";
import { Users, Star } from "lucide-react";
import { testimonials } from "@/data/home/testimonials";
import { LightingContainer, LightingEffect } from "@/components/ui/lighting-effect";
import { cn } from "@/lib/utils";

export function TestimonialsSection() {
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
          <div className="text-center mb-16">
            <AnimatedText
              text="What Parents Say"
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
              variant="slideUp"
            />
            <p className="text-lg text-muted-foreground">Hear from our school community</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="h-full relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 mr-3 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
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
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </LightingContainer>
  );
}