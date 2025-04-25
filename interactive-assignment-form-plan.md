# Implementation Plan for InteractiveAssignmentForm Component

## Phase 2A: Basic Form Structure (2-3 days)

### 1. Initial Setup
```typescript
// src/components/interactive/InteractiveAssignmentForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { interactiveAssignmentService } from '@/services/interactiveAssignmentService';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { FileUploader } from '@/components/ui/file-uploader';
```

### 2. Form Schema Definition
```typescript
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  dueDate: z.date(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedTimeMinutes: z.number().int().positive(),
  ageGroup: z.enum(['nursery', 'lkg', 'ukg', 'elementary']),
  questions: z.array(questionSchema).default([]),
  files: z.array(z.instanceof(File)).optional()
});
```

### 3. Basic Component Structure
```typescript
export function InteractiveAssignmentForm({
  initialData,
  onSubmit,
  onCancel
}: InteractiveAssignmentFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || defaultValues
  });

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <BasicDetailsSection />
      <FileAttachmentsSection />
      <FormActions />
    </form>
  );
}
```

## Phase 2B: Question Management (3-4 days)

### 1. Question List Component
```typescript
// src/components/interactive/QuestionList.tsx
export function QuestionList({ 
  questions, 
  onReorder, 
  onEdit, 
  onDelete 
}: QuestionListProps) {
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="questions">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {questions.map((question, index) => (
              <QuestionItem 
                key={question.id} 
                question={question} 
                index={index}
                onEdit={() => onEdit(index)}
                onDelete={() => onDelete(index)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

### 2. Question Type Forms
Create separate components for each question type:
- MatchingQuestionForm
- CompletionQuestionForm
- MultipleChoiceQuestionForm
- DrawingQuestionForm
- OrderingQuestionForm
- etc.

## Phase 2C: Preview and Enhanced Features (2-3 days)

### 1. Assignment Preview Component
```typescript
// src/components/interactive/AssignmentPreview.tsx
export function AssignmentPreview({ 
  assignment, 
  viewMode 
}: AssignmentPreviewProps) {
  return (
    <div className="preview-container">
      <PreviewHeader assignment={assignment} />
      <QuestionPreviewList questions={assignment.questions} />
      <PreviewControls onViewModeChange={setViewMode} />
    </div>
  );
}
```

### 2. Validation Implementation
```typescript
const enhancedValidation = {
  ...formSchema,
  questions: z.array(questionSchema)
    .min(1, 'At least one question is required')
    .refine(
      (questions) => questions.every(q => isValidQuestionData(q)),
      'All questions must be properly configured'
    )
};
```

### 3. Confirmation Dialog
```typescript
// src/components/interactive/SubmissionDialog.tsx
export function SubmissionDialog({
  isOpen,
  onClose,
  onConfirm,
  assignment
}: SubmissionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <AssignmentSummary assignment={assignment} />
        <DialogActions>
          <Button onClick={() => onConfirm('draft')}>Save as Draft</Button>
          <Button onClick={() => onConfirm('publish')}>Publish</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
```

## Testing Strategy

### 1. Unit Tests
```typescript
// src/components/interactive/__tests__/InteractiveAssignmentForm.test.tsx
describe('InteractiveAssignmentForm', () => {
  it('validates required fields', async () => {
    // Test implementation
  });

  it('handles question reordering', async () => {
    // Test implementation
  });

  it('manages file attachments', async () => {
    // Test implementation
  });
});
```

### 2. Integration Tests
```typescript
// src/tests/integration/assignment-creation.test.tsx
describe('Assignment Creation Flow', () => {
  it('creates and saves a complete assignment', async () => {
    // Test implementation
  });

  it('handles editing existing assignments', async () => {
    // Test implementation
  });
});
```

## Implementation Timeline

1. **Days 1-2:**
   - Basic form structure
   - Form schema definition
   - Basic assignment details section

2. **Days 3-4:**
   - Question management implementation
   - Question type forms
   - Drag-and-drop reordering

3. **Days 5-6:**
   - Preview functionality
   - Enhanced validation
   - Confirmation dialog

4. **Days 7-8:**
   - Testing
   - Bug fixes
   - Performance optimization

## Deployment Checklist

1. Code Review Requirements:
   - TypeScript strict mode compliance
   - Component test coverage
   - Accessibility standards met
   - Performance benchmarks passed

2. Testing Requirements:
   - Unit tests passing
   - Integration tests passing
   - Browser compatibility verified
   - Mobile responsiveness confirmed

3. Documentation:
   - Component API documentation
   - Usage examples
   - Common pitfalls and solutions
