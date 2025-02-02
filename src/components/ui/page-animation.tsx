import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { animations, delays, combineAnimations } from "@/lib/animations"

interface PageAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  delay?: keyof typeof delays
  animation?: keyof typeof animations
  useScrollAnimation?: boolean
}

export function PageAnimation({
  children,
  className,
  delay,
  animation = "fadeIn",
  useScrollAnimation = false,
  ...props
}: PageAnimationProps) {
  const [isVisible, setIsVisible] = useState(!useScrollAnimation)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!useScrollAnimation) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [useScrollAnimation])

  return (
    <div
      ref={elementRef}
      className={cn(
        combineAnimations(
          animations[animation],
          delay,
          isVisible ? "opacity-100" : "opacity-0"
        ),
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
  delay,
  animation = "cardPopIn",
  ...props
}: PageAnimationProps) {
  return (
    <div
      className={cn(combineAnimations(animations[animation], delay), className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SectionAnimation({
  children,
  className,
  delay,
  animation = "fadeInUp",
  ...props
}: PageAnimationProps) {
  return (
    <PageAnimation
      useScrollAnimation
      animation={animation}
      delay={delay}
      className={className}
      {...props}
    >
      {children}
    </PageAnimation>
  )
}
