import { Button } from "./button";
import { ButtonProps } from "@/components/ui/button";
import { ReactElement } from "react";

interface ButtonWithIconProps extends ButtonProps {
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
}

export function ButtonWithIcon({
  children,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: ButtonWithIconProps) {
  return (
    <Button {...props} className={`flex items-center gap-2 ${className}`}>
      {leftIcon}
      {children}
      {rightIcon}
    </Button>
  );
}