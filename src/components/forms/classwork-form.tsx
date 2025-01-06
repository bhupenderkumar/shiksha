import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { FileUploader } from '@/components/FileUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClassSubjects } from '@/hooks/use-class-subjects';
import type { ClassworkType } from '@/services/classworkService';
import toast from 'react-hot-toast';
import { fileService } from '@/services/fileService';

type ClassworkFormProps = {
  onSubmit: (data: any) => Promise<void>;
  initialData?: ClassworkType;
};

export function ClassworkForm({ onSubmit, initialData }: ClassworkFormProps) {
  const { classes, loading } = useClassSubjects();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || new Date(),
    classId: initialData?.classId || '',
    attachments: initialData?.attachments || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId) {
      toast.error('Please select a class');
      return;
    }

    try {
      // Handle file uploads first
      const uploadedFiles = await Promise.all(
        formData.attachments
          .filter(file => !file.id) // Only upload new files
          .map(async (file: File) => {
            return await fileService.uploadFile(file, `classwork/${formData.classId}`);
          })
      );

      // Combine existing and new files
      const allFiles = [
        ...formData.attachments.filter(file => file.id), // Keep existing files
        ...uploadedFiles // Add newly uploaded files
      ];

      await onSubmit({
        ...formData,
        attachments: allFiles
      });
    } catch (error) {
      console.error('Error submitting classwork:', error);
      toast.error('Failed to create classwork');
    }
  };

  const handleFileUpload = (files: any[]) => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleFileDelete = (fileId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(file => file.id !== fileId)
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
            selected={formData.date}
            onSelect={(date) => setFormData({ ...formData, date: date ?? new Date() })}
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
            maxFiles={5}
            acceptedFileTypes={['image/*', 'application/pdf', '.doc', '.docx']}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 sticky bottom-0 bg-background pt-4 border-t">
        <Button type="submit">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
