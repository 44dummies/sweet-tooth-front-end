import { motion } from "framer-motion";
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InteractiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

const InteractiveButton = ({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: InteractiveButtonProps) => {
  const baseStyles = "relative overflow-hidden font-semibold rounded-xl transition-all duration-300";

  const variantStyles = {
    primary: "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-xl hover:shadow-primary/50",
    secondary: "bg-secondary text-foreground hover:bg-secondary/80",
    outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white"
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
};

export default InteractiveButton;
