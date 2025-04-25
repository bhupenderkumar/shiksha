import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { CalendarIcon, Plus, Trash, Edit, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom" // Import useNavigate for redirection
import { interactiveAssignmentService } from "@/services/interactiveAssignmentService"
import { InteractiveAssignmentType } from "@/types/interactiveAssignment"
import { classService } from "@/services/classService"
import { loadSubjects } from "@/services/subjectService"
import { useAuth } from "@/lib/auth" // Import the auth hook
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { QuestionFormSelector } from "./question-forms/QuestionFormSelector"

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum([
    'MATCHING', 'COMPLETION', 'DRAWING', 'MULTIPLE_CHOICE', 'ORDERING',
    'SORTING', 'PUZZLE', 'IDENTIFICATION', 'COUNTING',
    'TRACING', 'AUDIO_READING', 'COLORING', 'HANDWRITING', 'LETTER_TRACING',
    'NUMBER_RECOGNITION', 'PICTURE_WORD_MATCHING', 'PATTERN_COMPLETION', 'CATEGORIZATION'
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
    // Make questionType more flexible - accept null/undefined and transform to string
    questionType: z.union([
      z.string(),
      z.null(),
      z.undefined()
    ]).transform(val => val ? String(val) : 'MATCHING') as z.ZodType<InteractiveAssignmentType>,

    questionText: z.union([
      z.string().min(1, 'Question text is required'),
      z.null(),
      z.undefined()
    ]).transform(val => val || ''),
    questionData: z.any(),

    // Make order more flexible - accept string and transform to number
    order: z.union([
      z.number(),
      z.string().transform(val => parseInt(val) || 0),
      z.null(),
      z.undefined()
    ]).transform(val => typeof val === 'number' ? val : 0).optional(),

    // Make all these fields more flexible by accepting null/undefined and transforming to empty string
    audioInstructions: z.union([z.string(), z.null(), z.undefined()]).transform(val => val || '').optional(),
    hintText: z.union([z.string(), z.null(), z.undefined()]).transform(val => val || '').optional(),
    hintImageUrl: z.union([z.string(), z.null(), z.undefined()]).transform(val => val || '').optional(),
    feedbackCorrect: z.union([z.string(), z.null(), z.undefined()]).transform(val => val || '').optional(),
    feedbackIncorrect: z.union([z.string(), z.null(), z.undefined()]).transform(val => val || '').optional()
  })),
})

type FormValues = z.infer<typeof formSchema>

interface InteractiveAssignmentFormProps {
  initialData?: FormValues & { id?: string };
  onSubmit?: (data: FormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function InteractiveAssignmentForm({
  initialData,
  onSubmit,
  onCancel
}: InteractiveAssignmentFormProps) {
  const navigate = useNavigate() // Initialize the navigate hook for redirection
  const { user } = useAuth() // Get the current user from auth context
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQuestionDialog, setShowQuestionDialog] = useState(false)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null)
  const [currentQuestionType, setCurrentQuestionType] = useState<InteractiveAssignmentType>('MATCHING')
  const [newQuestionText, setNewQuestionText] = useState('')
  const [questionData, setQuestionData] = useState<any>({})
  const questionFormRef = React.useRef<any>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>('')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: initialData?.type || 'MATCHING',
      classId: initialData?.classId || '',
      subjectId: initialData?.subjectId || '',
      dueDate: initialData?.dueDate || undefined,
      status: initialData?.status || 'DRAFT',
      difficultyLevel: initialData?.difficultyLevel || 'beginner',
      estimatedTimeMinutes: initialData?.estimatedTimeMinutes || 0,
      hasAudioFeedback: initialData?.hasAudioFeedback || false,
      hasCelebration: initialData?.hasCelebration || true,
      requiresParentHelp: initialData?.requiresParentHelp || false,
      questions: initialData?.questions || [],
    }
  })

  const { fields: questions, append, remove, update } = useFieldArray({
    control: form.control,
    name: "questions"
  })

  // Reset form when dialog closes
  useEffect(() => {
    if (!showQuestionDialog && editingQuestionIndex === null) {
      setNewQuestionText('');
      setQuestionData({});
    }
  }, [showQuestionDialog, editingQuestionIndex])

  // Set current question type and question text when editing
  useEffect(() => {
    if (editingQuestionIndex !== null && questions[editingQuestionIndex]) {
      console.log("Setting question data for editing:", questions[editingQuestionIndex]);
      // Ensure we have valid data by providing defaults for missing values
      setCurrentQuestionType(questions[editingQuestionIndex].questionType || 'MATCHING');
      setNewQuestionText(questions[editingQuestionIndex].questionText || '');
      setQuestionData(questions[editingQuestionIndex].questionData || {});
    }
  }, [editingQuestionIndex, questions])

  // Load classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        toast.loading('Loading classes...', { id: 'classes-toast' });
        const classData = await classService.getAllClasses();
        setClasses(classData || []);

        // If we have initialData with a classId, set it as selected and load subjects
        if (initialData?.classId) {
          setSelectedClassId(initialData.classId);
          toast.success('Classes loaded successfully', { id: 'classes-toast' });
        } else {
          toast.success('Classes loaded successfully', { id: 'classes-toast' });
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes: ' + (error instanceof Error ? error.message : 'Unknown error'), { id: 'classes-toast' });
        alert('Error loading classes. Please refresh the page and try again.');
      }
    };

    fetchClasses();
  }, [initialData])

  // Load subjects when selectedClassId changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClassId) return;

      try {
        toast.loading('Loading subjects for selected class...', { id: 'subjects-toast' });
        const subjectData = await loadSubjects(selectedClassId);
        setSubjects(subjectData || []);
        toast.success('Subjects loaded successfully', { id: 'subjects-toast' });
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast.error('Failed to load subjects: ' + (error instanceof Error ? error.message : 'Unknown error'), { id: 'subjects-toast' });
        alert('Error loading subjects. Please try selecting a different class or refresh the page.');
      }
    };

    fetchSubjects();
  }, [selectedClassId])

  // Update selectedClassId when form value changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'classId' && value.classId) {
        setSelectedClassId(value.classId);
      }
    });

    return () => subscription.unsubscribe();
  }, [form])

  async function onFormSubmit(data: FormValues) {
    try {
      // Validate that we have at least one question
      if (data.questions.length === 0) {
        toast.error("At least one question is required")
        alert("Please add at least one question before submitting.")
        return
      }

      // Create a new object with fixed data to avoid modifying the original
      const fixedData = {
        ...data,
        questions: data.questions.map((question, index) => {
          // Create a new question object with fixed values
          return {
            // Ensure questionType is a valid string
            questionType: question.questionType ?
              (typeof question.questionType === 'string' ?
                question.questionType :
                String(question.questionType)) as InteractiveAssignmentType :
              'MATCHING' as InteractiveAssignmentType,

            // Ensure order is a number
            order: index + 1,

            // Ensure other fields are strings
            questionText: question.questionText || '',
            questionData: question.questionData || {},
            audioInstructions: question.audioInstructions || '',
            hintText: question.hintText || '',
            hintImageUrl: question.hintImageUrl || '',
            feedbackCorrect: question.feedbackCorrect || '',
            feedbackIncorrect: question.feedbackIncorrect || ''
          };
        })
      };

      // Log the fixed data for debugging
      console.log('Fixed form data:', fixedData);

      // Use the fixed data instead of the original data
      data = fixedData;

      setIsSubmitting(true)
      console.log('Form submission started')
      toast.loading('Starting form submission...', { id: 'form-submit-toast' })

      // Skip auth check completely
      console.log('Initial data:', initialData)
      toast.loading('Processing form data...', { id: 'form-submit-toast' })

      // Prepare the data for submission
      const formattedData = {
        title: data.title,
        description: data.description,
        type: data.type,
        classId: data.classId,
        subjectId: data.subjectId,
        dueDate: data.dueDate,
        status: data.status,
        difficultyLevel: data.difficultyLevel,
        estimatedTimeMinutes: data.estimatedTimeMinutes,
        hasAudioFeedback: data.hasAudioFeedback,
        hasCelebration: data.hasCelebration,
        requiresParentHelp: data.requiresParentHelp,
        questions: data.questions.map((question, index) => {
          // Handle null questionType by providing a default value
          // Use a default of 'MATCHING' if questionType is null or undefined
          const questionType = question.questionType ?
            (question.questionType as InteractiveAssignmentType) :
            'MATCHING' as InteractiveAssignmentType;

          // Force order to be a number
          const order = index + 1;

          // Log for debugging
          console.log(`Form question ${index + 1}:`, {
            questionTypeOriginal: question.questionType,
            questionTypeConverted: questionType,
            questionTypeType: typeof questionType,
            orderOriginal: index + 1,
            orderConverted: order,
            orderType: typeof order
          });

          // Create a question object with both camelCase and snake_case properties
          // This ensures compatibility with both the form and the database
          return {
            // camelCase versions for TypeScript/React
            questionType,
            questionText: question.questionText || '', // Ensure questionText is never null
            questionData: question.questionData || {},
            order,
            audioInstructions: question.audioInstructions || '',
            hintText: question.hintText || '',
            hintImageUrl: question.hintImageUrl || '',
            feedbackCorrect: question.feedbackCorrect || '',
            feedbackIncorrect: question.feedbackIncorrect || '',

            // snake_case versions for database
            question_type: questionType,
            question_text: question.questionText || '',
            question_data: question.questionData || {},
            question_order: order,
            audio_instructions: question.audioInstructions || '',
            hint_text: question.hintText || '',
            hint_image_url: question.hintImageUrl || '',
            feedback_correct: question.feedbackCorrect || '',
            feedback_incorrect: question.feedbackIncorrect || ''
          };
        })
      }

      console.log('Formatted data:', formattedData)

      // If onSubmit is provided, use it (this is the case for EditInteractiveAssignment)
      if (onSubmit) {
        console.log("Using parent component's onSubmit handler")
        console.log("Sending fixed data to parent handler:", data)
        toast.loading('Submitting to parent handler...', { id: 'form-submit-toast' })
        try {
          // Pass the fixed data to the parent handler
          await onSubmit(data)
          // Note: The parent handler will show its own success message

          // If this is a new assignment (not an update), redirect to the assignments page
          if (!initialData) {
            console.log("Redirecting to assignments page after successful creation via parent handler")
            setTimeout(() => {
              navigate('/interactive-assignments')
            }, 1000) // Short delay to allow the success toast to be visible
          }
        } catch (error) {
          console.error("Error in parent onSubmit handler:", error)
          toast.error('Error in form submission: ' + (error instanceof Error ? error.message : 'Unknown error'), { id: 'form-submit-toast' })
          alert("Error submitting form: " + (error instanceof Error ? error.message : 'Unknown error'))
          throw error
        }
        return
      }

      // Otherwise handle submission directly (for create flow)
      let result
      if (initialData?.id) {
        console.log("Form submitting update for ID:", initialData.id)

        try {
          // Update existing assignment
          console.log('Calling interactiveAssignmentService.update with ID:', initialData.id)
          result = await interactiveAssignmentService.update(initialData.id, formattedData)
          console.log('Update result:', result)

          // Update questions separately
          if (result) {
            console.log("Updating questions from form for ID:", initialData.id)
            try {
              await interactiveAssignmentService.updateQuestions(initialData.id, formattedData.questions)
              console.log("Questions updated successfully")
            } catch (questionsError) {
              console.error("Error updating questions:", questionsError)
              toast.error("Failed to update questions")
            }
          } else {
            console.error("Failed to update assignment, not updating questions")
          }
        } catch (updateError) {
          console.error("Error during update:", updateError)
          throw updateError
        }
      } else {
        // Create new assignment
        console.log("Creating new assignment")
        // Use the current user's ID, or a fallback UUID if user is not available
        const userId = user?.id || '00000000-0000-0000-0000-000000000000'
        console.log("Using user ID:", userId)

        try {
          // Try to create the assignment with the user ID
          result = await interactiveAssignmentService.create(formattedData, userId)
        } catch (createError) {
          console.error("Error creating assignment with user ID:", createError)

          // If that fails, try with a hardcoded UUID as fallback
          console.log("Trying with fallback UUID...")
          result = await interactiveAssignmentService.create(formattedData, '00000000-0000-0000-0000-000000000000')
        }
      }

      if (result) {
        toast.success(initialData ? "Assignment updated successfully" : "Assignment created successfully")

        // If this is a new assignment (not an update), redirect to the assignments page
        if (!initialData) {
          console.log("Redirecting to assignments page after successful creation")
          setTimeout(() => {
            navigate('/interactive-assignments')
          }, 1000) // Short delay to allow the success toast to be visible
        }
      } else {
        toast.error("Failed to " + (initialData ? "update" : "create") + " assignment")
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error("Failed to submit form: " + (error instanceof Error ? error.message : 'Unknown error'), { id: 'form-submit-toast' })
      alert("Error submitting form: " + (error instanceof Error ? error.message : 'Unknown error') + "\n\nPlease check the console for more details.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{initialData ? 'Edit' : 'Create'} Interactive Assignment</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit, (errors) => {
          console.error('Form validation errors:', errors);

          // Create a message with all validation errors
          const errorMessages = [];

          if (errors.title) errorMessages.push(`Title: ${errors.title.message}`);
          if (errors.description) errorMessages.push(`Description: ${errors.description.message}`);
          if (errors.type) errorMessages.push(`Assignment Type: ${errors.type.message}`);
          if (errors.classId) errorMessages.push(`Class: ${errors.classId.message}`);
          if (errors.subjectId) errorMessages.push(`Subject: ${errors.subjectId.message}`);
          if (errors.dueDate) errorMessages.push(`Due Date: ${errors.dueDate.message}`);
          if (errors.difficultyLevel) errorMessages.push(`Difficulty Level: ${errors.difficultyLevel.message}`);
          if (errors.estimatedTimeMinutes) errorMessages.push(`Estimated Time: ${errors.estimatedTimeMinutes.message}`);

          // Check for question errors
          if (errors.questions) {
            if (Array.isArray(errors.questions)) {
              errors.questions.forEach((questionError, index) => {
                if (questionError) {
                  Object.entries(questionError).forEach(([field, error]) => {
                    const errorMessage = error && typeof error === 'object' && 'message' in error
                      ? error.message
                      : 'Invalid value';
                    errorMessages.push(`Question ${index + 1} - ${field}: ${errorMessage}`);
                  });
                }
              });
            } else {
              errorMessages.push(`Questions: ${errors.questions.message}`);
            }
          }

          // Show toast with all errors
          toast.error('Please fix the following errors:');

          // Show alert with all errors
          if (errorMessages.length > 0) {
            alert('Please fix the following validation errors:\n\n' + errorMessages.join('\n'));
          } else {
            alert('Form validation failed. Please check all fields and try again.');
          }
        })} className="space-y-8">
          {/* Basic Assignment Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Assignment title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a description of the assignment"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MATCHING">Matching</SelectItem>
                          <SelectItem value="COMPLETION">Completion</SelectItem>
                          <SelectItem value="DRAWING">Drawing</SelectItem>
                          <SelectItem value="COLORING">Coloring</SelectItem>
                          <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                          <SelectItem value="ORDERING">Ordering</SelectItem>
                          <SelectItem value="TRACING">Tracing</SelectItem>
                          <SelectItem value="AUDIO_READING">Audio Reading</SelectItem>
                          <SelectItem value="COUNTING">Counting</SelectItem>
                          <SelectItem value="IDENTIFICATION">Identification</SelectItem>
                          <SelectItem value="PUZZLE">Puzzle</SelectItem>
                          <SelectItem value="SORTING">Sorting</SelectItem>
                          <SelectItem value="HANDWRITING">Handwriting</SelectItem>
                          <SelectItem value="LETTER_TRACING">Letter Tracing</SelectItem>
                          <SelectItem value="NUMBER_RECOGNITION">Number Recognition</SelectItem>
                          <SelectItem value="PICTURE_WORD_MATCHING">Picture-Word Matching</SelectItem>
                          <SelectItem value="PATTERN_COMPLETION">Pattern Completion</SelectItem>
                          <SelectItem value="CATEGORIZATION">Categorization</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficultyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} {cls.section ? `- ${cls.section}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        disabled={!selectedClassId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedClassId ? "Select subject" : "Select a class first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedTimeMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Time (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value || 0}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="hasAudioFeedback"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Audio Feedback</FormLabel>
                        <FormDescription>
                          Enable audio feedback for students
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasCelebration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Celebration</FormLabel>
                        <FormDescription>
                          Show celebration on completion
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiresParentHelp"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Parent Help</FormLabel>
                        <FormDescription>
                          Requires parent assistance
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Question Management Section */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Questions
                {questions.length === 0 && (
                  <span className="ml-2 text-sm text-red-500 font-normal">
                    (At least one question is required)
                  </span>
                )}
              </CardTitle>
              <Button
                type="button"
                onClick={() => {
                  setEditingQuestionIndex(null);
                  setShowQuestionDialog(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-6 text-gray-500 flex flex-col items-center">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p>No questions added yet. Click "Add Question" to create your first question.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Question {index + 1}</h3>
                            <p className="text-sm text-gray-500">Type: {question.questionType}</p>
                            <p className="mt-2">{question.questionText}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Set the editing index first
                                setEditingQuestionIndex(index);
                                // Then show the dialog
                                setShowQuestionDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setQuestionToDelete(index);
                                setShowDeleteConfirmation(true);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question Dialog */}
          <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                <DialogDescription>
                  {editingQuestionIndex !== null
                    ? 'Edit the question details below.'
                    : 'Fill in the details to create a new question.'}
                </DialogDescription>
              </DialogHeader>

              {/* Dialog content */}

              <div className="space-y-4 py-4 pb-6 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 gap-4">
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select
                      value={currentQuestionType}
                      onValueChange={(value) => setCurrentQuestionType(value as InteractiveAssignmentType)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MATCHING">Matching</SelectItem>
                        <SelectItem value="COMPLETION">Completion</SelectItem>
                        <SelectItem value="DRAWING">Drawing</SelectItem>
                        <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                        <SelectItem value="ORDERING">Ordering</SelectItem>
                        <SelectItem value="SORTING">Sorting</SelectItem>
                        <SelectItem value="PUZZLE">Puzzle</SelectItem>
                        <SelectItem value="IDENTIFICATION">Identification</SelectItem>
                        <SelectItem value="COUNTING">Counting</SelectItem>
                        <SelectItem value="TRACING">Tracing</SelectItem>
                        <SelectItem value="AUDIO_READING">Audio Reading</SelectItem>
                        <SelectItem value="COLORING">Coloring</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the question text or instructions"
                        value={newQuestionText}
                        onChange={(e) => {
                          // Always just update the temporary state, never the actual question
                          setNewQuestionText(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage>Question text is required</FormMessage>
                  </FormItem>

                  {/* Question type specific form */}
                  <QuestionFormSelector
                    questionType={currentQuestionType}
                    initialData={editingQuestionIndex !== null ? questions[editingQuestionIndex].questionData : questionData}
                    onChange={(data) => {
                      // Store the data locally but don't update the question
                      // This prevents automatic updates when typing
                      setQuestionData(data);
                    }}
                    ref={questionFormRef}
                  />
                </div>
              </div>

              <DialogFooter className="sticky bottom-0 bg-white pt-2 border-t shadow-[0_-2px_4px_rgba(0,0,0,0.1)] z-10">
                <Button variant="outline" onClick={() => {
                  setShowQuestionDialog(false);
                  setNewQuestionText('');
                  setQuestionData({});
                  setEditingQuestionIndex(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Validate question text
                  if (!newQuestionText.trim()) {
                    toast.error('Question text is required');
                    return;
                  }

                  // Get the current form data from the QuestionFormSelector component
                  // This ensures we have the latest data even if the automatic updates were disabled
                  const currentFormData = questionFormRef.current?.getCurrentFormData() || questionData;

                  console.log("Current form data:", currentFormData);
                  console.log("Current question type:", currentQuestionType);

                  if (editingQuestionIndex !== null) {
                    try {
                      // Update existing question
                      const updatedQuestion = {
                        ...questions[editingQuestionIndex],
                        questionType: currentQuestionType,
                        questionText: newQuestionText,
                        questionData: currentFormData,
                        // Ensure we have both camelCase and snake_case versions
                        question_type: currentQuestionType,
                        question_text: newQuestionText,
                        question_data: currentFormData
                      };

                      console.log("Updating question at index", editingQuestionIndex, "with data:", updatedQuestion);

                      // Only update when the button is clicked
                      update(editingQuestionIndex, updatedQuestion);

                      // Close the dialog and reset state
                      setShowQuestionDialog(false);
                      setQuestionData({});
                      setNewQuestionText('');
                      setEditingQuestionIndex(null);
                      toast.success('Question updated');
                    } catch (error) {
                      console.error("Error updating question:", error);
                      toast.error('Failed to update question: ' + (error instanceof Error ? error.message : 'Unknown error'));
                    }
                  } else {
                    try {
                      // Add new question
                      const newQuestion = {
                        questionType: currentQuestionType,
                        questionText: newQuestionText,
                        questionData: currentFormData,
                        order: questions.length,
                        // Ensure we have both camelCase and snake_case versions
                        question_type: currentQuestionType,
                        question_text: newQuestionText,
                        question_data: currentFormData,
                        question_order: questions.length
                      };

                      console.log("Adding new question with data:", newQuestion);

                      append(newQuestion);
                      setNewQuestionText('');
                      setQuestionData({});
                      setShowQuestionDialog(false);
                      toast.success('Question added');
                    } catch (error) {
                      console.error("Error adding question:", error);
                      toast.error('Failed to add question: ' + (error instanceof Error ? error.message : 'Unknown error'));
                    }
                  }
                }}>
                  {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the question.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setQuestionToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (questionToDelete !== null) {
                      try {
                        console.log("Deleting question at index:", questionToDelete);
                        remove(questionToDelete);
                        toast.success('Question deleted');
                        setQuestionToDelete(null);

                        // After deletion, we need to update the order of remaining questions
                        // This will be handled when the form is submitted
                      } catch (error) {
                        console.error("Error deleting question:", error);
                        toast.error('Failed to delete question: ' + (error instanceof Error ? error.message : 'Unknown error'));
                      }
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel ? onCancel : () => navigate('/interactive-assignments')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Assignment' : 'Create Assignment')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
