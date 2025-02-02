import { motion } from "framer-motion";
import { useYouTubeVideos } from "@/hooks/useYouTubeVideos";
import { Alert } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { LightingContainer, LightingEffect } from "@/components/ui/lighting-effect";
import { cn } from "@/lib/utils";

export function VideosSection() {
  const { videos, isLoading, error } = useYouTubeVideos();

  if (error) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <Alert variant="destructive">
            <p>Failed to load videos: {error.message}</p>
          </Alert>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground mt-2">Loading videos...</p>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <Alert>
            <p>No videos available at the moment.</p>
          </Alert>
        </div>
      </section>
    );
  }

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
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Latest School Activities
          </h2>

          <div className="flex overflow-x-auto space-x-6 pb-4">
            {videos.map((video) => (
              <motion.div
                key={video.id.videoId}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "video-item min-w-[300px] overflow-hidden group relative",
                  "bg-white/80 backdrop-blur-sm",
                  "rounded-3xl shadow-xl",
                  "border-2 border-primary/20",
                  "transform transition-all duration-300",
                  "hover:scale-105 hover:rotate-1",
                  "hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20"
                )}
              >
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${video.id.videoId}`}
                  title={video.snippet.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <div className="p-4">
                  <h3 className={cn(
                    "text-lg font-black line-clamp-2",
                    "bg-gradient-to-r from-primary to-purple-600",
                    "bg-clip-text text-transparent",
                    "group-hover:scale-105 transform transition-all duration-300",
                    "drop-shadow-sm"
                  )}>
                    {video.snippet.title}
                  </h3>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </LightingContainer>
  );
}