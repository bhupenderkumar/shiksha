import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, Phone, Mail, MapPin, Heart } from "lucide-react";
import { SCHOOL_INFO } from "@/constants/schoolInfo";

const quickLinks = [
  { label: "Admission Enquiry", to: "/admission-enquiry" },
  { label: "Fee Structure", to: "/fee-structure" },
  { label: "Submit Feedback", to: "/parent-feedback-submission" },
  { label: "View Feedback", to: "/parent-feedback-search" },
  { label: "Sports Week", to: "/sports-week" },
];

const moreLinks = [
  { label: "Portal Login", to: "/login" },
  { label: "Date Sheet", to: "/final-date-sheet" },
];

export function Footer() {
  return (
    <footer className="relative bg-slate-900 text-white overflow-hidden">
      {/* Top accent gradient */}
      <div className="h-1 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold block leading-tight">First Step</span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Public School</span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {SCHOOL_INFO.tagline}. Providing quality education since {SCHOOL_INFO.establishedYear}.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-violet-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* More */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">More</h3>
            <ul className="space-y-2.5">
              {moreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-violet-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href={`tel:${SCHOOL_INFO.phone}`} className="flex items-center gap-3 text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  {SCHOOL_INFO.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SCHOOL_INFO.email}`} className="flex items-center gap-3 text-sm text-slate-400 hover:text-pink-400 transition-colors">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{SCHOOL_INFO.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{SCHOOL_INFO.address}</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-800 my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {SCHOOL_INFO.name}. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for our school family
          </p>
        </div>
      </div>
    </footer>
  );
}
