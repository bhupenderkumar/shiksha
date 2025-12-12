import { motion } from "framer-motion";
import { useYouTubeVideos } from "@/hooks/useYouTubeVideos";
import { Alert } from "@/components/ui/alert";
import { Loader2, Play, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export function VideosSection() {
  const { videos, isLoading, error } = useYouTubeVideos();

  if (error) {
    return (
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <Alert variant="destructive">
            <p>Failed to load videos: {error.message}</p>
          </Alert>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-red-500" />
          <p className="text-zinc-400 mt-4">Loading videos...</p>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <Alert>
            <p>No videos available at the moment.</p>
          </Alert>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-6">
            <Video className="w-4 h-4" />
            School Activities
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Watch Our{" "}
            <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Latest Videos
            </span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Explore our school events, activities, and celebrations
          </p>
        </motion.div>

        {/* Videos horizontal scroll */}
        <div className="relative">
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide">
            {videos.map((video, index) => (
              <motion.div
                key={video.id.videoId}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group flex-shrink-0 w-[350px] snap-start"
              >
                <div className={cn(
                  "rounded-2xl overflow-hidden",
                  "bg-zinc-900 border border-zinc-800",
                  "hover:border-zinc-700 transition-all duration-300",
                  "hover:shadow-2xl hover:shadow-red-500/10"
                )}>
                  {/* Video thumbnail with play overlay */}
                  <div className="relative">
                    <iframe
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${video.id.videoId}`}
                      title={video.snippet.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full"
                    />
                  </div>
                  
                  {/* Video info */}
                  <div className="p-5">
                    <h3 className="text-white font-semibold line-clamp-2 group-hover:text-red-400 transition-colors">
                      {video.snippet.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-zinc-500 text-sm">
                      <Play className="w-4 h-4" />
                      <span>Watch on YouTube</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}