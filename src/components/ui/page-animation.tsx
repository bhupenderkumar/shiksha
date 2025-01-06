import { cn } from "@/lib/utils"

interface PageAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function PageAnimation({
  children,
  className,
  delay = 0,
  ...props
}: PageAnimationProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom duration-700",
        delay && `delay-${delay}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardAnimation({
  children,
  className,
  delay = 0,
  ...props
}: PageAnimationProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in zoom-in duration-500",
        delay && `delay-${delay}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
