import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { SCHOOL_INFO } from "@/constants/schoolInfo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "Features", href: "#features" },
  { label: "Admissions", href: "#admissions" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setIsMobileOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.1)]"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src={SCHOOL_INFO.logo}
                alt={SCHOOL_INFO.name}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-contain"
              />
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-slate-800 leading-tight block">
                  First Step
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Public School
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-violet-600 rounded-lg hover:bg-violet-50 transition-all duration-200"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href={`tel:${SCHOOL_INFO.phone}`}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden lg:inline">{SCHOOL_INFO.phone}</span>
              </a>
              <Link
                to="/admission-enquiry"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Apply Now
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {isMobileOpen ? (
                <X className="w-6 h-6 text-slate-700" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xl md:hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  to="/admission-enquiry"
                  onClick={() => setIsMobileOpen(false)}
                  className="block w-full text-center px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-200"
                >
                  Apply for Admission
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
