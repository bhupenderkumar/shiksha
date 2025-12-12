import { motion } from "framer-motion";
import { Star, Globe, Image as ImageIcon, Loader2, Quote, ArrowRight } from "lucide-react";
import { testimonials } from "@/data/home/testimonials";
import { useGooglePlaceDetails } from "@/hooks/useGooglePlaceDetails";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState } from "react";

export function TestimonialsSection() {
  const { isLoading, error, placeDetails, photoUrls } = useGooglePlaceDetails();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-medium mb-6">
            <Quote className="w-4 h-4" />
            What Parents Say
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
              Hundreds
            </span>
            {" "}of Families
          </h2>
        </motion.div>

        {/* Testimonials - Featured Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {/* Featured testimonial */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 h-full">
              {/* Big quote mark */}
              <Quote className="absolute top-8 right-8 w-24 h-24 text-zinc-800" />
              
              <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed mb-8">
                  "{testimonials[activeTestimonial].text}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                    {testimonials[activeTestimonial].name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {testimonials[activeTestimonial].name}
                    </div>
                    <div className="text-zinc-500">
                      {testimonials[activeTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial list */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={cn(
                  "p-6 rounded-2xl cursor-pointer transition-all duration-300",
                  activeTestimonial === index
                    ? "bg-zinc-800/80 border border-zinc-700"
                    : "bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50"
                )}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white transition-all",
                    activeTestimonial === index 
                      ? "bg-gradient-to-br from-pink-500 to-orange-500"
                      : "bg-zinc-700"
                  )}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{testimonial.name}</div>
                    <div className="text-sm text-zinc-500">{testimonial.role}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Google Reviews Section */}
        {placeDetails && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Google Reviews</h3>
                  <p className="text-zinc-400">
                    <span className="text-yellow-400 font-semibold">{placeDetails.rating}</span>/5 from {placeDetails.user_ratings_total} reviews
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
              </div>
            ) : error ? (
              <div className="text-center text-red-400 py-8">
                Failed to load reviews
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {placeDetails?.reviews.slice(0, 4).map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.profile_photo_url} />
                        <AvatarFallback className="bg-zinc-700 text-white">
                          {review.author_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white text-sm">{review.author_name}</div>
                        <div className="text-xs text-zinc-500">{review.relative_time_description}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3 h-3",
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-700"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-zinc-400 text-sm line-clamp-3">{review.text}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Photo Gallery */}
        {photoUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Campus Gallery</h3>
                <p className="text-zinc-400">Take a virtual tour of our facilities</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photoUrls.slice(0, 8).map((photoUrl, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <AspectRatio ratio={1}>
                    <img
                      src={photoUrl}
                      alt={`Campus photo ${index + 1}`}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  </AspectRatio>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}