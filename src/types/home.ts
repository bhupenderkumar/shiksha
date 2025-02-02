import { LucideIcon } from "lucide-react";

export interface Review {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  profile_photo_url: string;
  time: number;
}

export interface Photo {
  photo_reference: string;
}

export interface Video {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
  };
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  link?: string;
}

export interface Achievement {
  number: string;
  label: string;
}

export interface Testimonial {
  name: string;
  role: string;
  rating: number;
  text: string;
  photo: string;
}