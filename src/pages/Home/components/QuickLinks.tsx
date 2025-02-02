import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LightingContainer, LightingEffect } from "@/components/ui/lighting-effect";
import { cn } from "@/lib/utils";

const links = [
  {
    to: "/admission-enquiry",
    label: "Admission Enquiry",
  },
  {
    to: "/year-end-feedback",
    label: "Submit Year-End Feedback",
  },
  {
    to: "/view-year-end-feedback",
    label: "View Feedback Records",
  },
];

export function QuickLinks() {
  return (
    <LightingContainer>
      <section className="relative py-16 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden">
        {/* Lighting effects */}
        <LightingEffect
          variant="glow"
          color="secondary"
          size="xl"
          position="center"
          className="opacity-20"
        />
        <LightingEffect
          variant="beam"
          color="primary"
          size="lg"
          position="top"
          className="opacity-10"
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Quick Links
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access important features and information quickly
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between group relative overflow-hidden",
                    "hover:bg-primary hover:text-white transition-colors duration-300"
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  <ArrowRight className="ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </LightingContainer>
  );
}