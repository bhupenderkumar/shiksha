import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import { useState, useEffect } from "react"
import { interactiveAssignmentService } from "@/services/interactiveAssignmentService"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum([
    'MATCHING', 'COMPLETION', 'DRAWING', 'MULTIPLE_CHOICE', 'ORDERING',
    'SORTING', 'PUZZLE', 'IDENTIFICATION', 'COUNTING',
    'TRACING', 'AUDIO_READING'
  ]),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  dueDate: z.date(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedTimeMinutes: z.number().min(1).optional(),
  hasAudioFeedback: z.boolean().default(false),
  hasCelebration: z.boolean().default(true),
  requiresParentHelp: z.boolean().default(false),
  questions: z.array(z.object({
    questionType: z.string(),
    questionText: z.string(),
    data: z.any()
  })).min(1, 'At least one question is required'),
})

type FormValues = z.infer<typeof formSchema>

interface InteractiveAssignmentFormProps {
  initialData?: FormValues;
  onSubmit?: (data: FormValues) => void;
  onCancel?: () => void;
}

export function InteractiveAssignmentForm({
  initialData,
  onSubmit,
  onCancel
}: InteractiveAssignmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      type: 'MATCHING',
      status: 'DRAFT',
      hasAudioFeedback: false,
      hasCelebration: true,
      requiresParentHelp: false,
      questions: [],
    }
  })

  async function onFormSubmit(data: FormValues) {
    try {
      setIsSubmitting(true)

      // TODO: Implement actual form submission
      console.log('Form data:', data)
      toast({
        title: "Success",
        description: "Assignment created successfully",
      })

      if (onSubmit) {
        onSubmit(data)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Interactive Assignment</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
          {/* TODO: Add form fields based on schema */}

          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
