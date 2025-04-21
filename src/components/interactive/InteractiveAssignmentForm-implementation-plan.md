# Detailed Implementation Plan for InteractiveAssignmentForm.tsx

## 1. Component Structure and Imports

```typescript
// src/components/interactive/InteractiveAssignmentForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusCircle, Trash2, Copy, Eye, Save, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { interactiveAssignmentService } from '@/services/interactiveAssignmentService';
import { classService } from '@/services/classService';
import { subjectService } from '@/services/subjectService';
import { FileUploader } from '@/components/shared/FileUploader';
import { ExerciseRenderer } from './exercise-renderer';
import { 
  InteractiveAssignment, 
  InteractiveQuestion, 
  InteractiveAssignmentType,
  CreateInteractiveAssignmentData,
  UpdateInteractiveAssignmentData
} from '@/types/interactiveAssignment';
```

## 2. Form Schema Definition

```typescript
// Zod schema for form validation
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum([
    'MATCHING', 'COMPLETION', 'DRAWING', 'MULTIPLE_CHOICE', 'ORDERING', 
    'SORTING', 'CATEGORIZATION', 'PUZZLE', 'IDENTIFICATION', 'COUNTING', 
    'TRACING', 'LETTER_TRACING', 'COLORING', 'AUDIO_READING'
  ] as const),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  dueDate: z.date(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedTimeMinutes: z.number().int().positive().optional(),
  hasAudioFeedback: z.boolean().default(false),
  hasCelebration: z.boolean().default(true),
  ageGroup: z.enum(['nursery', 'lkg', 'ukg', 'elementary']).optional(),
  requiresParentHelp: z.boolean().default(false),
  questions: z.array(
    z.object({
      id: z.string().optional(),
      questionType: z.enum([
        'MATCHING', 'COMPLETION', 'DRAWING', 'MULTIPLE_CHOICE', 'ORDERING', 
        'SORTING', 'CATEGORIZATION', 'PUZZLE', 'IDENTIFICATION', 'COUNTING', 
        'TRACING', 'LETTER_TRACING', 'COLORING', 'AUDIO_READING'
      ] as const),
      questionText: z.string().min(1, 'Question text is required'),
      questionData: z.any(),
      order: z.number().int().nonnegative(),
      audioInstructions: z.string().optional(),
      hintText: z.string().optional(),
      hintImageUrl: z.string().optional(),
      feedbackCorrect: z.string().optional(),
      feedbackIncorrect: z.string().optional()
    })
  ).default([]),
  files: z.array(z.instanceof(File)).optional()
});

type FormValues = z.infer<typeof formSchema>;
```

## 3. Component Props and Interface

```typescript
interface InteractiveAssignmentFormProps {
  initialData?: InteractiveAssignment;
  onSubmit?: (data: InteractiveAssignment) => void;
  onCancel?: () => void;
}
```

## 4. Main Component Implementation

```typescript
export function InteractiveAssignmentForm({
  initialData,
  onSubmit,
  onCancel
}: InteractiveAssignmentFormProps) {
  // State for classes and subjects
  const [classes, setClasses] = useState<{ id: string; name: string; section: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);
  
  // State for file management
  const [existingFiles, setExistingFiles] = useState<{ id: string; fileName: string; url: string }[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  
  // State for preview
  const [previewMode, setPreviewMode] = useState<'teacher' | 'student'>('teacher');
  const [showPreview, setShowPreview] = useState(false);
  
  // State for confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formAction, setFormAction] = useState<'publish' | 'draft'>('publish');
  
  // State for active question being edited
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);
  
  // Form setup with react-hook-form and zod
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      type: initialData.type,
      classId: initialData.classId,
      subjectId: initialData.subjectId,
      dueDate: new Date(initialData.dueDate),
      status: initialData.status,
      difficultyLevel: initialData.difficultyLevel,
      estimatedTimeMinutes: initialData.estimatedTimeMinutes,
      hasAudioFeedback: initialData.hasAudioFeedback,
      hasCelebration: initialData.hasCelebration,
      ageGroup: initialData.ageGroup,
      requiresParentHelp: initialData.requiresParentHelp,
      questions: initialData.questions?.map(q => ({
        id: q.id,
        questionType: q.questionType,
        questionText: q.questionText,
        questionData: q.questionData,
        order: q.order,
        audioInstructions: q.audioInstructions,
        hintText: q.hintText,
        hintImageUrl: q.hintImageUrl,
        feedbackCorrect: q.feedbackCorrect,
        feedbackIncorrect: q.feedbackIncorrect
      })) || []
    } : {
      title: '',
      description: '',
      type: 'MULTIPLE_CHOICE',
      classId: '',
      subjectId: '',
      dueDate: new Date(),
      status: 'DRAFT',
      difficultyLevel: 'beginner',
      estimatedTimeMinutes: 15,
      hasAudioFeedback: false,
      hasCelebration: true,
      ageGroup: 'elementary',
      requiresParentHelp: false,
      questions: []
    }
  });
  
  // Field array for questions
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "questions"
  });
  
  // Load classes and subjects on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const classesData = await classService.getAll();
        setClasses(classesData);
        
        const subjectsData = await subjectService.getAll();
        setSubjects(subjectsData);
        
        // Load existing files if editing
        if (initialData?.id) {
          const assignment = await interactiveAssignmentService.getById(initialData.id);
          if (assignment?.attachments) {
            setExistingFiles(assignment.attachments.map(file => ({
              id: file.id,
              fileName: file.fileName,
              url: file.url || ''
            })));
          }
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        toast.error('Failed to load form data');
      }
    };
    
    loadData();
  }, [initialData?.id]);
  
  // Handle file uploads
  const handleFileUpload = (files: File[]) => {
    setNewFiles(prev => [...prev, ...files]);
  };
  
  // Handle file removal
  const handleFileRemove = (fileName: string) => {
    setNewFiles(prev => prev.filter(file => file.name !== fileName));
  };
  
  // Handle existing file removal
  const handleExistingFileRemove = (fileId: string) => {
    setExistingFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  // Handle question reordering with drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };
  
  // Handle form submission
  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    try {
      const values = form.getValues();
      values.status = status;
      
      // Update question order based on current position
      const updatedQuestions = values.questions.map((q, index) => ({
        ...q,
        order: index + 1
      }));
      
      const formData: CreateInteractiveAssignmentData | UpdateInteractiveAssignmentData = {
        title: values.title,
        description: values.description,
        type: values.type,
        classId: values.classId,
        subjectId: values.subjectId,
        dueDate: values.dueDate,
        status: values.status,
        difficultyLevel: values.difficultyLevel,
        estimatedTimeMinutes: values.estimatedTimeMinutes,
        hasAudioFeedback: values.hasAudioFeedback,
        hasCelebration: values.hasCelebration,
        ageGroup: values.ageGroup,
        requiresParentHelp: values.requiresParentHelp,
        questions: updatedQuestions,
        files: newFiles
      };
      
      let result;
      if (initialData?.id) {
        result = await interactiveAssignmentService.update(initialData.id, formData as UpdateInteractiveAssignmentData);
      } else {
        result = await interactiveAssignmentService.create(formData as CreateInteractiveAssignmentData, 'current-user-id'); // Replace with actual user ID
      }
      
      if (result) {
        toast.success(`Assignment ${initialData ? 'updated' : 'created'} successfully`);
        if (onSubmit) onSubmit(result);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    }
  };
  
  // Handle confirmation dialog
  const handleConfirmSubmit = (action: 'publish' | 'draft') => {
    setFormAction(action);
    setShowConfirmation(true);
  };
  
  // Handle final submission after confirmation
  const handleFinalSubmit = () => {
    const status = formAction === 'publish' ? 'PUBLISHED' : 'DRAFT';
    handleSubmit(status);
    setShowConfirmation(false);
  };
  
  // Handle adding a new question
  const handleAddQuestion = (type: InteractiveAssignmentType) => {
    const newQuestion = {
      questionType: type,
      questionText: '',
      questionData: {},
      order: fields.length + 1
    };
    append(newQuestion);
    setActiveQuestionIndex(fields.length);
  };
}
```

## 5. Form Sections Implementation

### 5.1 Basic Assignment Details Section

```tsx
<Card>
  <CardHeader>
    <CardTitle>Assignment Details</CardTitle>
    <CardDescription>Basic information about the assignment</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Title and Description fields */}
    {/* Class and Subject Selection */}
    {/* Assignment Type and Due Date */}
    {/* Additional Settings */}
  </CardContent>
</Card>
```

### 5.2 Question Management Section

```tsx
<Card>
  <CardHeader>
    <CardTitle>Questions</CardTitle>
    <CardDescription>Add and manage questions for this assignment</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Question Type Selector */}
    {/* Question List with drag-and-drop */}
    {/* Dynamic Question Forms based on type */}
  </CardContent>
</Card>
```

### 5.3 File Attachments Section

```tsx
<Card>
  <CardHeader>
    <CardTitle>File Attachments</CardTitle>
    <CardDescription>Upload files for this assignment</CardDescription>
  </CardHeader>
  <CardContent>
    <FileUploader
      onUpload={handleFileUpload}
      maxFiles={5}
      maxSize={5 * 1024 * 1024} // 5MB
      acceptedTypes={{
        'image/*': [],
        'application/pdf': [],
        'audio/*': []
      }}
    />
    
    {/* Display existing files */}
    {existingFiles.length > 0 && (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Existing Files</h4>
        <div className="space-y-2">
          {existingFiles.map(file => (
            <div key={file.id} className="flex items-center justify-between p-2 border rounded-md">
              <span>{file.fileName}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleExistingFileRemove(file.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    )}
    
    {/* Display new files */}
    {newFiles.length > 0 && (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">New Files</h4>
        <div className="space-y-2">
          {newFiles.map(file => (
            <div key={file.name} className="flex items-center justify-between p-2 border rounded-md">
              <span>{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleFileRemove(file.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    )}
  </CardContent>
</Card>
```

### 5.4 Preview Section

```tsx
<Card>
  <CardHeader>
    <CardTitle>Preview</CardTitle>
    <CardDescription>Preview how the assignment will appear to students</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex justify-end mb-4">
      <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as 'teacher' | 'student')}>
        <TabsList>
          <TabsTrigger value="teacher">Teacher View</TabsTrigger>
          <TabsTrigger value="student">Student View</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
    
    <div className="border rounded-md p-4">
      {form.watch('questions').length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Add questions to preview the assignment</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">{form.watch('title')}</h3>
          <p className="text-gray-700">{form.watch('description')}</p>
          
          <div className="space-y-4 mt-6">
            {form.watch('questions').map((question, index) => (
              <div key={index} className="border-t pt-4">
                <ExerciseRenderer
                  question={{
                    id: question.id || `preview-${index}`,
                    assignmentId: initialData?.id || 'preview',
                    questionType: question.questionType,
                    questionText: question.questionText,
                    questionData: question.questionData,
                    order: question.order,
                    audioInstructions: question.audioInstructions,
                    hintText: question.hintText,
                    hintImageUrl: question.hintImageUrl,
                    feedbackCorrect: question.feedbackCorrect,
                    feedbackIncorrect: question.feedbackIncorrect
                  }}
                  readOnly={previewMode === 'teacher'}
                  showAnswers={previewMode === 'teacher'}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

### 5.5 Form Actions Section

```tsx
<div className="flex justify-end space-x-4 mt-8">
  <Button
    type="button"
    variant="outline"
    onClick={onCancel}
  >
    Cancel
  </Button>
  <Button
    type="button"
    variant="secondary"
    onClick={() => handleConfirmSubmit('draft')}
  >
    Save as Draft
  </Button>
  <Button
    type="submit"
    onClick={() => handleConfirmSubmit('publish')}
  >
    {initialData ? 'Update' : 'Publish'} Assignment
  </Button>
</div>

{/* Confirmation Dialog */}
<Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        {formAction === 'publish' ? 'Publish Assignment' : 'Save as Draft'}
      </DialogTitle>
      <DialogDescription>
        {formAction === 'publish'
          ? 'This will make the assignment visible to students. Are you sure you want to publish?'
          : 'Save your progress without publishing to students.'}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-2">
      <p><strong>Title:</strong> {form.watch('title')}</p>
      <p><strong>Questions:</strong> {form.watch('questions').length}</p>
      <p><strong>Due Date:</strong> {form.watch('dueDate')?.toLocaleDateString()}</p>
    </div>
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowConfirmation(false)}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleFinalSubmit}
      >
        {formAction === 'publish' ? 'Publish' : 'Save Draft'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## 6. Question Type-Specific Form Components

For each question type, create a separate component that handles the specific form fields required for that question type. For example:

### 6.1 MultipleChoiceQuestionForm

```tsx
interface MultipleChoiceQuestionFormProps {
  value: any;
  onChange: (value: any) => void;
  error?: any;
}

export function MultipleChoiceQuestionForm({
  value,
  onChange,
  error
}: MultipleChoiceQuestionFormProps) {
  const options = value?.options || [];
  
  const addOption = () => {
    onChange({
      ...value,
      options: [
        ...options,
        {
          id: uuidv4(),
          text: '',
          isCorrect: false
        }
      ]
    });
  };
  
  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    onChange({
      ...value,
      options: newOptions
    });
  };
  
  const updateOption = (index: number, field: string, fieldValue: any) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: fieldValue
    };
    onChange({
      ...value,
      options: newOptions
    });
  };
  
  const toggleAllowMultiple = (allow: boolean) => {
    onChange({
      ...value,
      allowMultiple: allow
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="allowMultiple"
          checked={value?.allowMultiple || false}
          onChange={(e) => toggleAllowMultiple(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="allowMultiple">Allow multiple selections</Label>
      </div>
      
      <div className="space-y-2">
        <Label>Options</Label>
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={option.isCorrect}
              onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
              className="h-4 w-4"
            />
            <Input
              value={option.text}
              onChange={(e) => updateOption(index, 'text', e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeOption(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          className="mt-2"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </div>
    </div>
  );
}
```

### 6.2 MatchingQuestionForm

Similar components would be created for each question type, with specific form fields for that type.

## 7. Implementation Steps

1. Create the basic InteractiveAssignmentForm.tsx file with imports and component structure
2. Implement the form schema and validation with zod
3. Set up form state management with react-hook-form
4. Implement the basic assignment details section
5. Create the question management section with drag-and-drop functionality
6. Implement file attachment handling
7. Create the preview section
8. Implement form submission logic with confirmation dialog
9. Create type-specific question form components for each question type
10. Add error handling and validation feedback
11. Test the form with various question types and scenarios

## 8. Testing Strategy

1. Unit tests for form validation
2. Component tests for form submission
3. Integration tests with services
4. Usability testing for the question management UX
5. Accessibility testing
6. Cross-browser testing

## 9. Conclusion

This implementation plan provides a comprehensive approach to building the InteractiveAssignmentForm component. The component will allow teachers to create and edit interactive assignments with various question types, file attachments, and preview capabilities. The form will follow best practices for form management, validation, and user experience.
