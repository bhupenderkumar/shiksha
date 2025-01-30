
import { motion } from "framer-motion";
import { EnquiryStatus } from "@/types/admission";
import { Card } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";
import { ADMISSION_STATUS } from "@/lib/constants";

export interface ProcessTimelineProps {
  status?: EnquiryStatus;
  currentStep?: number;
  completedSteps?: string[];
  onStepClick?: (route: string) => void;
  className?: string;
  enquiryId?: string;
}

interface Step {
  stage: string;
  status: EnquiryStatus;
  description: string;
  route: (id?: string) => string;
  completed: boolean;
  current: boolean;
}

const validStatusOrder = [
  ADMISSION_STATUS.NEW,
  ADMISSION_STATUS.IN_REVIEW,
  ADMISSION_STATUS.SCHEDULED_INTERVIEW,
  ADMISSION_STATUS.PENDING_DOCUMENTS,
  ADMISSION_STATUS.APPROVED,
  ADMISSION_STATUS.ENROLLED,
] as const;

export function ProcessTimeline({
  status = ADMISSION_STATUS.NEW,
  currentStep = 1,
  completedSteps = [],
  onStepClick = () => {},
  className = "",
  enquiryId
}: ProcessTimelineProps) {
  const getStepStatus = (stepStatus: EnquiryStatus) => {
    // Get index of current status and step status
    const currentIndex = validStatusOrder.indexOf(status as typeof validStatusOrder[number]);
    const stepIndex = validStatusOrder.indexOf(stepStatus as typeof validStatusOrder[number]);

    // If status is not in valid order (e.g. REJECTED), treat as not completed/current
    if (currentIndex === -1) {
      return {
        completed: false,
        current: false,
      };
    }

    return {
      completed: currentIndex > stepIndex,
      current: currentIndex === stepIndex,
    };
  };

  const steps: Step[] = [
    {
      stage: "Enquiry",
      status: ADMISSION_STATUS.NEW,
      description: "Fill and submit the online admission enquiry form",
      route: (id?: string) => id ? `/admission-progress/${id}?tab=enquiry` : "/admission-enquiry",
      ...getStepStatus(ADMISSION_STATUS.NEW),
    },
    {
      stage: "Document Upload",
      status: ADMISSION_STATUS.IN_REVIEW,
      description: "Upload required documents for review",
      route: (id?: string) => id ? `/admission-progress/${id}?tab=documents` : "/admission-enquiry",
      ...getStepStatus(ADMISSION_STATUS.IN_REVIEW),
    },
    {
      stage: "Interview",
      status: ADMISSION_STATUS.SCHEDULED_INTERVIEW,
      description: "Schedule and attend the admission interview",
      route: (id?: string) => id ? `/admission-progress/${id}?tab=interview` : "/admission-enquiry",
      ...getStepStatus(ADMISSION_STATUS.SCHEDULED_INTERVIEW),
    },
    {
      stage: "Enrollment",
      status: ADMISSION_STATUS.APPROVED,
      description: "Complete enrollment and fee payment",
      route: (id?: string) => id ? `/admission-progress/${id}?tab=enrollment` : "/admission-enquiry",
      ...getStepStatus(ADMISSION_STATUS.APPROVED),
    }
  ];

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 ${className}`}>
      {/* Desktop Timeline */}
      <div className="hidden md:block relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-muted" />
        <div className="grid grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card
                className={`p-4 cursor-pointer transition-colors hover:bg-accent
                  ${step.completed ? 'border-primary' : ''}
                  ${step.current ? 'ring-2 ring-primary' : ''}
                `}
                onClick={() => onStepClick(step.route(enquiryId))}
              >
                <div className="flex flex-col items-center">
                  <div className="mb-4">
                    {step.completed ? (
                      <CheckCircle className="w-8 h-8 text-primary" />
                    ) : step.current ? (
                      <Circle className="w-8 h-8 text-primary" />
                    ) : (
                      <Circle className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.stage}</h3>
                  <p className="text-sm text-center text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Timeline */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.stage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-colors hover:bg-accent
                ${step.completed ? 'border-primary' : ''}
                ${step.current ? 'ring-2 ring-primary' : ''}
              `}
              onClick={() => onStepClick(step.route(enquiryId))}
            >
              <div className="flex items-start space-x-4">
                <div>
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  ) : step.current ? (
                    <Circle className="w-6 h-6 text-primary" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-1">{step.stage}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="w-6 h-6 flex items-center justify-center"
                >
                  <div className="w-2 h-2 border-r-2 border-t-2 border-current transform rotate-45" />
                </motion.div>
              </div>
            </Card>
          </motion.div>

        ))}
      </div>
    </div>
  );


}
