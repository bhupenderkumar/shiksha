import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUploader } from '@/components/FileUploader';
import { classService } from '@/services/classService';
import { HomeworkStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { fileService } from '@/services/fileService';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  status: z.enum(['PENDING', 'COMPLETED', 'OVERDUE', 'SUBMITTED']),
});

type FormData = z.infer<typeof formSchema>;

interface HomeworkFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  files?: Array<{ id: string; fileName: string; filePath: string }>;
  onCancel?: () => void;
  loading?: boolean;
}

export function HomeworkForm({ onSubmit, initialData, files: initialFiles, onCancel, loading }: HomeworkFormProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState(initialFiles || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      dueDate: new Date(initialData.dueDate)
    } : {
      status: 'PENDING'
    }
  });

  const selectedDate = watch('dueDate');
  const selectedClassId = watch('classId');
  const attachments = watch('attachments');

  // Load classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classService.getAll();
        setClasses(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      }
    };
    fetchClasses();
  }, []);

  // Load subjects when class is selected
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClassId) return;
      try {
        // Implement your subject fetching logic here
        // const data = await subjectService.getByClass(selectedClassId);
        // setSubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast.error('Failed to load subjects');
      }
    };
    fetchSubjects();
  }, [selectedClassId]);

  const handleFormSubmit = async (data: FormData) => {
    try {
      const uploadedFiles = attachments.length > 0 ? await Promise.all(
        files.map(async (file) => {
          return await fileService.uploadFile(file, `homework/${data.classId}`);
        })
      ) : [];

      // Only call delete if there are existing files to remove
      if (existingFiles.length > 0 || uploadedFiles.length > 0) {
        const formData = {
          ...data,
          attachments: [
            ...existingFiles,
            ...uploadedFiles
          ].filter(file => file.id) // Ensure only files with IDs are included
        };

        await onSubmit(formData);
      } else {
        // If no attachments, just submit the data without calling file service
        await onSubmit(data);
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast.error('Failed to create homework');
    }
  };

  const handleFileChange = (files: File[]) => {
    setFiles(files);
  };

  const removeExistingFile = (fileId: string) => {
    setExistingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'SUBMITTED', label: 'Submitted' }
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        <div className="space-y-2 col-span-full md:col-span-2">
          <Label htmlFor="title" className="text-base font-semibold">Title</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Enter homework title"
            className="w-full"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Class</Label>
          <Select
            value={selectedClassId}
            onValueChange={(value) => setValue('classId', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classId && (
            <p className="text-sm text-red-500">{errors.classId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setValue('dueDate', date || new Date())}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
          {errors.dueDate && (
            <p className="text-sm text-red-500">{errors.dueDate.message}</p>
          )}
        </div>

        <div className="space-y-2 col-span-full md:col-span-2">
          <Label htmlFor="description" className="text-base font-semibold">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Enter homework description"
            className="min-h-[100px]"
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Status</Label>
          <Select
            value={getValues('status')}
            onValueChange={(value) => setValue('status', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-500">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2 col-span-full md:col-span-2">
          <Label className="text-base font-semibold">Attachments</Label>
          <div className="mt-2">
            <FileUploader
              onFilesSelected={handleFileChange}
              maxFiles={5}
              acceptedFileTypes={[
                'image/*',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ]}
            />
          </div>
          {existingFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Existing Files:</h4>
              <div className="space-y-2">
                {existingFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <span className="text-sm truncate">{file.fileName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExistingFile(file.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => onCancel?.()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update' : 'Create'} Homework
        </Button>
      </div>
    </form>
  );
}