import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning" | "info";
}

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        {
          "bg-destructive/15 border-destructive text-destructive": variant === "destructive",
          "bg-background border-border text-foreground": variant === "default",
          "bg-green-50 border-green-200 text-green-800": variant === "success",
          "bg-yellow-50 border-yellow-200 text-yellow-800": variant === "warning",
          "bg-blue-50 border-blue-200 text-blue-800": variant === "info",
        },
        className
      )}
      {...props}
    />
  );
}

// Optional Alert Title component for more structured alerts
export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
}

// Optional Alert Description component for additional content
export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}