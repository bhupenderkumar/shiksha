import { useState, useEffect } from 'react';
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
import { fetchClassworkDetails } from '@/services/classworkService';
import { useAuth } from '@/lib/auth';

type ClassworkFormProps = {
  onSubmit: (data: any) => Promise<void>;
  initialData?: ClassworkType;
};

export function ClassworkForm({ onSubmit, initialData }: ClassworkFormProps) {
  const { user } = useAuth();
  const { classes, loading } = useClassSubjects();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || new Date(),
    classId: initialData?.classId || '',
    attachments: initialData?.attachments || [], // Ensure attachments is initialized as an array
  });

  useEffect(() => {
    const fetchData = async () => {
      if (initialData) {
        const classworkDetails = await fetchClassworkDetails(initialData.id);
        setFormData({
          ...formData,
          title: classworkDetails.title,
          description: classworkDetails.description,
          date: classworkDetails.date,
          classId: classworkDetails.classId,
          attachments: classworkDetails.attachments,
        });
      }
    };

    fetchData();
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId) {
      toast.error('Please select a class');
      return;
    }

    try {
      const newFiles = formData.attachments.filter(file => !file.id);
      const existingFiles = formData.attachments.filter(file => file.id);

      const timestamp = new Date().getTime();
      const uploadedFiles = await Promise.all(
        newFiles.map(async (file: File, index: number) => {
          const uniqueFileName = `${timestamp}_${index}_${file.name}`;
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
            throw error;
          }
        })
      );

      const submitData = {
        ...formData,
        attachments: [...existingFiles, ...uploadedFiles],
        uploadedBy: user?.id // This will only be used for file records
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting classwork:', error);
      toast.error('Failed to create classwork');
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
            acceptedFileTypes={['image/*']} // Only allow images
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
