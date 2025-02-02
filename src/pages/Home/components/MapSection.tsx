import { AnimatedText } from "@/components/ui/animated-text";
import { Alert } from "@/components/ui/alert";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { Loader2 } from "lucide-react";
import { LightingContainer, LightingEffect } from "@/components/ui/lighting-effect";
import { cn } from "@/lib/utils";

export function MapSection() {
  const { isLoading, error } = useGoogleMaps('school-map');

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
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            <div
              id="school-map"
              className={cn(
                "h-96 w-full rounded-lg shadow-lg",
                isLoading ? "opacity-50" : "opacity-100"
              )}
              style={{ transition: "opacity 0.3s ease" }}
            />
          </div>
        </div>
      </section>
    </LightingContainer>
  );
}