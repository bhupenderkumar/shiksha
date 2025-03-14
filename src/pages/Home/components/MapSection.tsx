import { AnimatedText } from "@/components/ui/animated-text";
import { Alert } from "@/components/ui/alert";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { Loader2 } from "lucide-react";
import { LightingContainer, LightingEffect } from "@/components/ui/lighting-effect";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";
import { motion } from "framer-motion";

export function MapSection() {
  const { isLoading, error } = useGoogleMaps('school-map');
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (error) {
    return (
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <Alert variant="destructive">
            <p>Failed to load map: {error.message}</p>
          </Alert>
        </div>
      </section>
    );
  }

  return (
    <LightingContainer>
      <section className="relative py-16 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden">
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
              text="Our Location"
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
              variant="slideUp"
            />
            <p className="text-lg text-muted-foreground">Find us on the map</p>
          </div>

          <div className="relative">
            {isLoading ? (
              <div className="h-96 w-full rounded-lg shadow-lg bg-background/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-lg overflow-hidden shadow-lg"
              >
                <div 
                  id="school-map"
                  className="h-96 w-full rounded-lg"
                  style={{ border: `4px solid rgba(var(--primary), 0.1)` }}
                />
                
                {/* Map Legend */}
                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-md">
                  <h4 className="font-semibold text-sm mb-2">Map Legend</h4>
                  <div className="flex items-center mb-1">
                    <div className="w-4 h-4 bg-primary rounded-full mr-2"></div>
                    <span className="text-xs">School</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-xs">Bus Route</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs">Landmarks</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </LightingContainer>
  );
}