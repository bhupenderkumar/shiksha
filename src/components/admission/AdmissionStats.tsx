import { motion } from "framer-motion";
import { Users, CheckCircle, GraduationCap, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: JSX.Element;
  title: string;
  value: string;
  delay?: number;
}

function StatCard({ icon, title, value, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
          >
            {icon}
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-3xl font-bold text-primary">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AdmissionStats() {
  const stats = [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Current Admissions",
      value: "2024-25"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
      title: "Success Rate",
      value: "95%"
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-primary" />,
      title: "Student Satisfaction",
      value: "4.8/5"
    },
    {
      icon: <Award className="w-6 h-6 text-primary" />,
      title: "Years of Excellence",
      value: "15+"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          icon={stat.icon}
          title={stat.title}
          value={stat.value}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}