import { motion } from "framer-motion";
import { useYouTubeVideos } from "@/hooks/useYouTubeVideos";
import { Alert } from "@/components/ui/alert";
import { Loader2, Play, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export function VideosSection() {
  const { videos, isLoading, error } = useYouTubeVideos();

  if (error) {
    return (
      <section className="py-20 bg-white">
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
      <section className="py-20 bg-white">
        <div className="container mx-auto text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-violet-500" />
          <p className="text-slate-400 mt-4">Loading videos...</p>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Alert>
            <p>No videos available at the moment.</p>
          </Alert>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-slate-50/50 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-500 text-sm font-semibold mb-4">
            <Video className="w-4 h-4" />
            School Activities
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Watch Our{" "}
            <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              Latest Videos
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Explore our school events, activities, and celebrations
          </p>
        </motion.div>

        {/* Videos horizontal scroll */}
        <div className="relative">
          <div className="flex overflow-x-auto gap-5 pb-4 snap-x snap-mandatory scrollbar-hide px-1">
            {videos.map((video, index) => (
              <motion.div
                key={video.id.videoId}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group flex-shrink-0 w-[300px] sm:w-[350px] snap-start"
              >
                <div className={cn(
                  "rounded-2xl overflow-hidden",
                  "bg-white border border-slate-100",
                  "hover:border-slate-200 transition-all duration-300",
                  "hover:shadow-xl hover:shadow-slate-100/50",
                  "hover:-translate-y-1"
                )}>
                  {/* Video embed */}
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
                    <h3 className="text-slate-800 font-semibold line-clamp-2 group-hover:text-violet-600 transition-colors text-sm">
                      {video.snippet.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-slate-400 text-xs">
                      <Play className="w-3.5 h-3.5" />
                      <span>Watch on YouTube</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
