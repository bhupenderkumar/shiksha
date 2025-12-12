import { Alert } from "@/components/ui/alert";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { Loader2, MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import { Button } from "@/components/ui/button";

export function MapSection() {
  const { isLoading, error } = useGoogleMaps('school-map', {
    maxRetries: 15,
    retryInterval: 300,
    timeout: 15000
  });

  if (error) {
    return (
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <Alert variant="destructive">
            <p>Failed to load map: {error.message}</p>
          </Alert>
        </div>
      </section>
    );
  }

  const contactItems = [
    { icon: MapPin, label: "Address", value: SCHOOL_INFO.address, color: "from-blue-500 to-cyan-500" },
    { icon: Phone, label: "Phone", value: SCHOOL_INFO.phone, href: `tel:${SCHOOL_INFO.phone}`, color: "from-green-500 to-emerald-500" },
    { icon: Mail, label: "Email", value: SCHOOL_INFO.email, href: `mailto:${SCHOOL_INFO.email}`, color: "from-purple-500 to-pink-500" },
    { icon: Clock, label: "Hours", value: "Mon-Sat: 8:00 AM - 3:00 PM", color: "from-orange-500 to-red-500" },
  ];

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <MapPin className="w-4 h-4" />
            Visit Us
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Find Your Way{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Here
            </span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            We'd love to show you around our campus. Schedule a visit today!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact info cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {contactItems.map((item, index) => {
              const Content = (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "group p-5 rounded-2xl",
                    "bg-zinc-900/80 border border-zinc-800",
                    "hover:border-zinc-700 transition-all duration-300",
                    item.href && "cursor-pointer"
                  )}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      "bg-gradient-to-br",
                      item.color
                    )}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-zinc-500 mb-1">{item.label}</div>
                      <div className="text-white font-medium">{item.value}</div>
                    </div>
                  </div>
                </motion.div>
              );

              return item.href ? (
                <a key={item.label} href={item.href}>
                  {Content}
                </a>
              ) : (
                <div key={item.label}>{Content}</div>
              );
            })}

            {/* Get Directions Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl py-6"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SCHOOL_INFO.address)}`, '_blank')}
              >
                <Navigation className="w-5 h-5 mr-2" />
                Get Directions
              </Button>
            </motion.div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            {isLoading ? (
              <div className="h-[500px] w-full rounded-3xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
                  <p className="text-zinc-400">Loading map...</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl shadow-blue-500/10">
                <div 
                  id="school-map"
                  className="h-[500px] w-full"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}