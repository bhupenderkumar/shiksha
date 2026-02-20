import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, MessageSquare, Eye, Zap, IndianRupee, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    to: "/admission-enquiry",
    label: "Admission Enquiry",
    description: "Start your child's journey with us",
    icon: ClipboardList,
    border: "border-blue-100",
    hoverBorder: "hover:border-blue-200",
    shadow: "hover:shadow-blue-100/50",
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  {
    to: "/fee-structure",
    label: "Fee Structure",
    description: "View detailed fee breakdowns",
    icon: IndianRupee,
    border: "border-amber-100",
    hoverBorder: "hover:border-amber-200",
    shadow: "hover:shadow-amber-100/50",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
  },
  {
    to: "/parent-feedback-submission",
    label: "Submit Feedback",
    description: "Share your valuable feedback",
    icon: MessageSquare,
    border: "border-purple-100",
    hoverBorder: "hover:border-purple-200",
    shadow: "hover:shadow-purple-100/50",
    iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    to: "/parent-feedback-search",
    label: "View Feedback",
    description: "Check teacher remarks & progress",
    icon: Eye,
    border: "border-emerald-100",
    hoverBorder: "hover:border-emerald-200",
    shadow: "hover:shadow-emerald-100/50",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
  },
  {
    to: "/sports-week",
    label: "Sports Week",
    description: "Enroll for exciting sports events",
    icon: Trophy,
    border: "border-red-100",
    hoverBorder: "hover:border-red-200",
    shadow: "hover:shadow-red-100/50",
    iconBg: "bg-gradient-to-br from-orange-500 to-red-500",
  },
];

export function QuickLinks() {
  return (
    <section className="relative py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            Quick Actions
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Get Started{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Today
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Access important features and connect with us instantly
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {links.map((link, index) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
            >
              <Link to={link.to} className="block group h-full">
                <div className={cn(
                  "relative h-full p-6 rounded-2xl",
                  "bg-white border",
                  link.border,
                  link.hoverBorder,
                  "shadow-sm hover:shadow-lg",
                  link.shadow,
                  "transition-all duration-300 hover:-translate-y-1"
                )}>
                  {/* Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    link.iconBg
                  )}>
                    <link.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-base font-bold text-slate-800 mb-1.5">
                    {link.label}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    {link.description}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400 group-hover:text-violet-600 transition-colors">
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
