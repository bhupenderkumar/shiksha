import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"
import { Input } from "./input"

export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={props.id}
            className="font-medium text-sm text-gray-700"
          >
            {label}
          </Label>
        )}
        <Input
          className={cn(
            "w-full",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500 font-handwriting">{error}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

export { FormField } 