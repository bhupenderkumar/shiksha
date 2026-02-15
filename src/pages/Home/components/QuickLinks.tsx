import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, MessageSquare, Eye, Zap, IndianRupee, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    to: "/admission-enquiry",
    label: "Admission Enquiry",
    description: "Start your child's journey with us. Apply now for the upcoming academic session.",
    icon: ClipboardList,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    to: "/fee-structure",
    label: "Fee Structure",
    description: "View detailed fee breakdowns, admission charges, monthly fees & promotion costs.",
    icon: IndianRupee,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    to: "/parent-feedback-submission",
    label: "Submit Parent Feedback",
    description: "Share your valuable feedback and help us improve our services.",
    icon: MessageSquare,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    to: "/parent-feedback-search",
    label: "View Teacher Feedback",
    description: "Check your child's academic progress and teacher remarks.",
    icon: Eye,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    to: "/sports-week",
    label: "Annual Sports Week",
    description: "Explore the Sports Week 2026 schedule & enroll your child for exciting events.",
    icon: Trophy,
    gradient: "from-orange-500 to-red-500",
  },
];

export function QuickLinks() {
  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Quick Actions
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Get Started{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Today
            </span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Access important features and connect with us instantly
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {links.map((link, index) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link to={link.to} className="block group h-full">
                <div className={cn(
                  "relative h-full p-8 rounded-3xl",
                  "bg-zinc-900/80 border border-zinc-800",
                  "hover:border-zinc-700 transition-all duration-500",
                  "overflow-hidden"
                )}>
                  {/* Gradient background on hover */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    "bg-gradient-to-br",
                    link.gradient
                  )} style={{ opacity: 0.05 }} />
                  
                  {/* Icon */}
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
                    "bg-gradient-to-br",
                    link.gradient
                  )}>
                    <link.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-zinc-400 mb-6 leading-relaxed group-hover:text-zinc-300 transition-colors">
                    {link.description}
                  </p>
                  
                  {/* Arrow CTA */}
                  <div className="flex items-center gap-2 text-white font-medium">
                    <span className={cn(
                      "bg-gradient-to-r bg-clip-text text-transparent",
                      link.gradient
                    )}>
                      Get Started
                    </span>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "bg-white/5 group-hover:bg-white/10 transition-colors"
                    )}>
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}