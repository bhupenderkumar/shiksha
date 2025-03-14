import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedText } from "@/components/ui/animated-text";
import { Link } from "react-router-dom";
import { StudentCharacter } from "@/components/animations/characters/StudentCharacter";
import { useTheme } from "@/lib/theme-provider";

interface AdmissionStep {
  step: number;
  title: string;
  description: string;
}

interface AdmissionJourneyProps {
  className?: string;
}

export function AdmissionJourney({ className = "" }: AdmissionJourneyProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const steps: AdmissionStep[] = [
    {
      step: 1,
      title: 'Submit Enquiry',
      description: 'Fill out the admission enquiry form with required details'
    },
    {
      step: 2,
      title: 'Document Submission',
      description: 'Submit required documents for verification'
    },
    {
      step: 3,
      title: 'Interview',
      description: 'Schedule and attend admission interview'
    },
    {
      step: 4,
      title: 'Admission Confirmation',
      description: 'Receive confirmation and join our school family'
    }
  ];

  // Animation variants
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Path colors
  const pathColors = {
    path: isDark ? "#4c566a" : "#dee2e6",
    highlight: isDark ? "#88c0d0" : "#74c0fc",
    checkpoint: isDark ? "#5e81ac" : "#4c6ef5",
  };

  return (
    <section className={`section-padding ${isDark 
      ? "bg-gradient-to-b from-blue-950/30 via-indigo-950/30 to-purple-950/30" 
      : "bg-gradient-to-b from-pink-50/50 via-blue-50/50 to-purple-50/50"} ${className}`}>
      <div className="container mx-auto container-padding">
        <div className="text-center mb-16">
          <AnimatedText
            text="Admission Process"
            className="text-3xl font-bold mb-4 text-gradient"
            variant="slideUp"
          />
          <p className="text-muted-foreground">Simple steps to join our school family</p>
        </div>

        {/* Journey Path with Student Character */}
        <div className="relative mb-16">
          {/* Path Line */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 h-[400px] w-4 rounded-full"
            style={{ background: pathColors.path }}
          />

          {/* Animated Path Highlight */}
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2 w-4 rounded-full"
            style={{ background: pathColors.highlight, height: 0 }}
            animate={{ height: "400px" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />

          {/* Student Character walking up the path */}
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2"
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            transition={{ duration: 5, ease: "easeInOut" }}
          >
            <StudentCharacter variant="walking" direction="right" />
          </motion.div>
        </div>

        <motion.div 
          className="grid md:grid-cols-4 gap-8"
          variants={containerAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              variants={itemAnimation}
              className="text-center glass card-hover p-6 rounded-lg relative"
            >
              {/* Checkpoint */}
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
                style={{ background: pathColors.checkpoint }}
              >
                <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
                  <span className="text-sm font-bold">{step.step}</span>
                </div>
              </div>

              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4 animate-float">
                <span className="text-2xl font-bold text-primary">{step.step}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <Button size="lg" className="button-glow gradient-primary text-white" asChild>
            <Link to="/admission-enquiry">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}