import React from "react";
import { Button, ButtonProps } from "./button";

interface ButtonWithIconProps extends ButtonProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function ButtonWithIcon({
  children,
  leftIcon,
  rightIcon,
  className,
  ...props
}: ButtonWithIconProps) {
  return (
    <Button className={`flex items-center gap-2 ${className || ''}`} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </Button>
  );
}