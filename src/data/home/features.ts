import { GraduationCap, Users, BookOpen, Heart, Star } from "lucide-react";
import type { Feature } from "@/types/home";

export const features: Feature[] = [
  {
    icon: GraduationCap,
    title: "Expert Faculty",
    description: "Our experienced teachers are passionate about nurturing young minds",
  },
  {
    icon: Users,
    title: "Small Class Sizes",
    description: "Individual attention for every student with optimal teacher-student ratio",
  },
  {
    icon: BookOpen,
    title: "Modern Curriculum",
    description: "Comprehensive education blending traditional values with modern learning",
  },
  {
    icon: Heart,
    title: "Holistic Development",
    description: "Focus on academic, physical, and emotional growth of every child",
  },
  {
    icon: Star,
    title: "Year-End Feedback",
    description: "Comprehensive feedback system for parents and students",
    link: "/year-end-feedback",
  },
];