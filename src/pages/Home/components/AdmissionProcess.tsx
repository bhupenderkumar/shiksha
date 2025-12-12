import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Upload, Users, CheckCircle2, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: 1,
    title: "Submit Enquiry",
    description: "Fill out the admission enquiry form with required details",
    icon: FileText,
  },
  {
    number: 2,
    title: "Document Submission",
    description: "Submit required documents for verification",
    icon: Upload,
  },
  {
    number: 3,
    title: "Interview",
    description: "Schedule and attend admission interview",
    icon: Users,
  },
  {
    number: 4,
    title: "Admission Confirmation",
    description: "Receive confirmation and join our school family",
    icon: CheckCircle2,
  },
];

export function AdmissionProcess() {
  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            Admission Process
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Your Journey{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Starts Here
            </span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Simple steps to join our school family
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-zinc-700 to-transparent hidden md:block" />
          
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="text-center relative group"
              >
                {/* Step circle */}
                <div className="relative mx-auto mb-6">
                  <motion.div
                    className={cn(
                      "w-20 h-20 rounded-2xl",
                      "bg-zinc-900 border-2 border-zinc-700",
                      "flex items-center justify-center",
                      "group-hover:border-violet-500/50 transition-colors duration-300",
                      "relative z-10"
                    )}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Gradient background on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity" />
                    
                    <step.icon className="w-8 h-8 text-violet-400" />
                  </motion.div>
                  
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm z-20">
                    {step.number}
                  </div>
                </div>

                {/* Step content */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold px-8 py-7 text-lg rounded-full shadow-2xl shadow-violet-500/20 hover:scale-105 transition-all duration-300 group"
          >
            <Link to="/admission-enquiry">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}