// This is a fix for the InteractiveAssignmentForm component
// Find the formSchema in your InteractiveAssignmentForm.tsx file and update the questionText validation

// Change this:
questionText: z.string().min(1, 'Question text is required'),

// To this:
questionText: z.union([
  z.string().min(1, 'Question text is required'),
  z.null(),
  z.undefined()
]).transform(val => val || ''),

// This will accept null or undefined values and transform them to an empty string
// which will satisfy the form validation
