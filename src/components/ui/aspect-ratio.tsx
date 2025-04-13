import * as React from "react";
import { cn } from "@/lib/utils";

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}

export function AspectRatio({
  ratio = 1 / 1,
  className,
  children,
  ...props
}: AspectRatioProps) {
  return (
    <div
      className={cn("relative w-full", className)}
      style={{ paddingBottom: `${100 / ratio}%` }}
      {...props}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}