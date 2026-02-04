import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { FileUploader } from '@/components/FileUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClassSubjects } from '@/hooks/use-class-subjects';
import type { ClassworkType, CreateClassworkData } from '@/services/classworkService';
import toast from 'react-hot-toast';
import { fileService } from '@/services/fileService';
import { fetchClassworkDetails } from '@/services/classworkService';
import { useAuth } from '@/lib/auth';

type ClassworkFormProps = {
  onSubmit: (data: CreateClassworkData) => Promise<void>;
  initialData?: ClassworkType;
};

export function ClassworkForm({ onSubmit, initialData }: ClassworkFormProps) {
  const { user } = useAuth();
  const { classes, loading } = useClassSubjects();
  
  const [formData, setFormData] = useState<Omit<CreateClassworkData, 'uploadedBy'>>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date) : new Date(), // Default to today
    classId: initialData?.classId || '',
    attachments: initialData?.attachments || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (initialData?.id) {
        try {
          const classworkDetails = await fetchClassworkDetails(initialData.id);
          setFormData({
            title: classworkDetails.title,
            description: classworkDetails.description,
            date: classworkDetails.date ? new Date(classworkDetails.date) : new Date(),
            classId: classworkDetails.classId,
            attachments: classworkDetails.attachments || [],
          });
        } catch (error) {
          console.error('Error fetching classwork details:', error);
          toast.error('Failed to load classwork details');
        }
      }
    };

    fetchData();
  }, [initialData?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId) {
      toast.error('Please select a class');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      const newFiles = formData.attachments.filter(file => !file.id) as File[];
      const existingFiles = formData.attachments.filter(file => file.id);

      const timestamp = new Date().getTime();
      const uploadedFiles = await Promise.all(
        newFiles.map(async (file: File, index: number) => {
          // Sanitize file name for storage - replace spaces and special characters
          const sanitizedFileName = file.name
            .replace(/\\s+/g, '_')
            .replace(/[^a-zA-Z0-9._-]/g, '');
          const uniqueFileName = `${timestamp}_${index}_${sanitizedFileName}`;
          const filePath = `classwork/${formData.classId}/${uniqueFileName}`;
          
          try {
            const uploadedFile = await fileService.uploadFile(file, filePath);
            return {
              fileName: file.name,
              filePath: uploadedFile?.path || filePath,
              fileType: file.type || 'application/octet-stream'
            };
          } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error(`Failed to upload file ${file.name}`);
          }
        })
      );

      const submitData: CreateClassworkData = {
        ...formData,
        attachments: [...existingFiles, ...uploadedFiles],
        uploadedBy: user.id
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting classwork:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create classwork');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      attachments: [
        ...(prev.attachments || []).filter(file => file.id), // Keep existing files
        ...files.map(file => file) // Add new files
      ]
    }));
  };

  const handleFileDelete = (fileId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter(file => file.id !== fileId)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          <Select
            value={formData.classId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}
          >
            <SelectTrigger>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <div className="border rounded-lg p-2 bg-background overflow-x-auto">
          <Calendar
            mode="single"
            selected={formData.date instanceof Date ? formData.date : new Date(formData.date)}
            onSelect={(date) => setFormData({ ...formData, date: date ?? new Date() })}
            defaultMonth={formData.date instanceof Date ? formData.date : new Date(formData.date)}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Attachments</Label>
        <div className="border rounded-lg p-4 bg-background">
          <FileUploader
            onFilesSelected={handleFileUpload}
            onFileDelete={handleFileDelete}
            existingFiles={formData.attachments}
            acceptedFileTypes={['image/*']} // Only allow images
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 sticky bottom-0 bg-background pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
