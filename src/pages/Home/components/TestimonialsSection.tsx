import { motion } from "framer-motion";
import { Star, Globe, Image as ImageIcon, Loader2, Quote } from "lucide-react";
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
    <section id="testimonials" className="relative py-20 bg-white overflow-hidden">
      {/* Soft background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-50/60 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-50/60 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-100 text-pink-600 text-sm font-semibold mb-4">
            <Quote className="w-4 h-4" />
            What Parents Say
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Hundreds
            </span>
            {" "}of Families
          </h2>
        </motion.div>

        {/* Testimonials Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
          {/* Featured testimonial */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-100/50 h-full">
              {/* Big quote mark */}
              <Quote className="absolute top-6 right-6 w-16 h-16 text-violet-200/50" />

              <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8">
                  "{testimonials[activeTestimonial].text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[activeTestimonial].name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-base">
                      {testimonials[activeTestimonial].name}
                    </div>
                    <div className="text-sm text-slate-400">
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
            className="space-y-3"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={cn(
                  "p-5 rounded-2xl cursor-pointer transition-all duration-300",
                  activeTestimonial === index
                    ? "bg-white border-2 border-violet-200 shadow-lg shadow-violet-100/30"
                    : "bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md"
                )}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white transition-all text-sm",
                    activeTestimonial === index
                      ? "bg-gradient-to-br from-violet-500 to-pink-500"
                      : "bg-slate-200 text-slate-500"
                  )}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-slate-400 truncate">{testimonial.role}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
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
            className="mb-16 max-w-5xl mx-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Google Reviews</h3>
                  <p className="text-sm text-slate-400">
                    <span className="text-amber-500 font-semibold">{placeDetails.rating}</span>/5 from {placeDetails.user_ratings_total} reviews
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
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
                    className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={review.profile_photo_url} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                          {review.author_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-700 text-xs">{review.author_name}</div>
                        <div className="text-[10px] text-slate-400">{review.relative_time_description}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3 h-3",
                            i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">{review.text}</p>
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
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Campus Gallery</h3>
                <p className="text-sm text-slate-400">Take a virtual tour of our facilities</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photoUrls.slice(0, 8).map((photoUrl, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
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
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl" />
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
