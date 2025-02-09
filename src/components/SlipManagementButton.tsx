import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight } from "lucide-react";

export function SlipManagementButton() {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button size="lg" variant="secondary">
        <Link to="/slip-management" className="flex items-center">
          <ClipboardList className="mr-2 h-4 w-4" />
          Slip Management
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </motion.div>
  );
}