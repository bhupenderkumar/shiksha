import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import { Button } from "@/components/ui/button";

export function MapSection() {
  const contactItems = [
    { icon: MapPin, label: "Address", value: SCHOOL_INFO.address, color: "from-blue-500 to-cyan-500", bg: "bg-blue-50", border: "border-blue-100" },
    { icon: Phone, label: "Phone", value: SCHOOL_INFO.phone, href: `tel:${SCHOOL_INFO.phone}`, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", border: "border-emerald-100" },
    { icon: Mail, label: "Email", value: SCHOOL_INFO.email, href: `mailto:${SCHOOL_INFO.email}`, color: "from-violet-500 to-purple-500", bg: "bg-violet-50", border: "border-violet-100" },
    { icon: Clock, label: "Hours", value: "Mon-Sat: 8:00 AM - 3:00 PM", color: "from-amber-500 to-orange-500", bg: "bg-amber-50", border: "border-amber-100" },
  ];

  return (
    <section id="contact" className="relative py-20 bg-slate-50/50 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-4">
            <MapPin className="w-4 h-4" />
            Visit Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Find Your Way{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Here
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            We'd love to show you around our campus. Schedule a visit today!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Contact info cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            {contactItems.map((item, index) => {
              const CardContent = (
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                    "bg-gradient-to-br",
                    item.color
                  )}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400 mb-0.5 font-medium">{item.label}</div>
                    <div className="text-sm text-slate-700 font-semibold truncate">{item.value}</div>
                  </div>
                </div>
              );

              return item.href ? (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={cn(
                    "group p-4 rounded-2xl block",
                    "bg-white border",
                    item.border,
                    "hover:shadow-md transition-all duration-300",
                    "cursor-pointer hover:-translate-y-0.5"
                  )}
                  whileHover={{ x: 4 }}
                >
                  {CardContent}
                </motion.a>
              ) : (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={cn(
                    "group p-4 rounded-2xl",
                    "bg-white border",
                    item.border,
                    "hover:shadow-md transition-all duration-300"
                  )}
                  whileHover={{ x: 4 }}
                >
                  {CardContent}
                </motion.div>
              );
            })}

            {/* Get Directions Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-2xl py-5 shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
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
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50">
              <iframe
                src="https://www.google.com/maps/embed/v1/place?key=AIzaSyD7IJF39_HZvW9Bhno1guh95uAfY79WpaA&q=The+First+Step+Public+School,Saurabh+Vihar,Jaitpur,Delhi&zoom=17"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="First Step Pre School - House No 164, H Block Saurabh Vihar, Jaitpur, Badarpur, Delhi"
                className="rounded-3xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
