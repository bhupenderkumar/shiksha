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
    color: "from-violet-500 to-indigo-500",
    lightBg: "bg-violet-50",
    lightBorder: "border-violet-100",
  },
  {
    number: 2,
    title: "Document Submission",
    description: "Submit required documents for verification",
    icon: Upload,
    color: "from-blue-500 to-cyan-500",
    lightBg: "bg-blue-50",
    lightBorder: "border-blue-100",
  },
  {
    number: 3,
    title: "Interview",
    description: "Schedule and attend admission interview",
    icon: Users,
    color: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50",
    lightBorder: "border-amber-100",
  },
  {
    number: 4,
    title: "Confirmation",
    description: "Receive confirmation and join our school family",
    icon: CheckCircle2,
    color: "from-emerald-500 to-teal-500",
    lightBg: "bg-emerald-50",
    lightBorder: "border-emerald-100",
  },
];

export function AdmissionProcess() {
  return (
    <section id="admissions" className="relative py-20 bg-gradient-to-b from-white via-violet-50/30 to-white overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-sm font-semibold mb-4">
            <GraduationCap className="w-4 h-4" />
            Admission Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Your Journey{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Starts Here
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Simple steps to join our school family
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line - desktop */}
          <div className="absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-violet-200 via-blue-200 via-amber-200 to-emerald-200 hidden md:block rounded-full" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, duration: 0.5 }}
                className="text-center relative group"
              >
                {/* Step circle */}
                <div className="relative mx-auto mb-5">
                  <motion.div
                    className={cn(
                      "w-[72px] h-[72px] rounded-2xl mx-auto",
                      "bg-white border-2",
                      step.lightBorder,
                      "flex items-center justify-center",
                      "group-hover:shadow-lg transition-all duration-300",
                      "relative z-10"
                    )}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <step.icon className="w-7 h-7 text-slate-500 group-hover:text-violet-500 transition-colors" />
                  </motion.div>

                  {/* Step number badge */}
                  <div className={cn(
                    "absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs z-20",
                    "bg-gradient-to-br",
                    step.color
                  )}>
                    {step.number}
                  </div>
                </div>

                {/* Step content */}
                <h3 className="text-base font-bold text-slate-800 mb-1.5 group-hover:text-violet-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed px-2">
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
          transition={{ delay: 0.5 }}
          className="mt-14 text-center"
        >
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 text-base rounded-2xl shadow-xl shadow-violet-200 hover:shadow-violet-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
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
