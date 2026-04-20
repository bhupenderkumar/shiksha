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
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Mic, PenLine } from 'lucide-react';
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
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    classId: initialData?.classId || '',
    workType: initialData?.workType || undefined,
    subjectId: initialData?.subjectId || undefined,
    chapterName: initialData?.chapterName || undefined,
    attachments: initialData?.attachments || [],
  });

  const [subjects, setSubjects] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load subjects when class changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!formData.classId) {
        setSubjects([]);
        return;
      }
      try {
        const { data, error } = await supabase
          .schema(SCHEMA as any)
          .from('Subject')
          .select('id, name, code')
          .eq('classId', formData.classId);
        if (error) throw error;
        setSubjects(data || []);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, [formData.classId]);

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
            workType: classworkDetails.workType || undefined,
            subjectId: classworkDetails.subjectId || undefined,
            chapterName: classworkDetails.chapterName || undefined,
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

      const uploadedFiles = await Promise.all(
        newFiles.map(async (file: File) => {
          const filePath = `classwork/${formData.classId}`;
          
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
        ...(prev.attachments || []).filter(file => file.id),
        ...files.map(file => file)
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Work Type Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Work Type</Label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, workType: 'oral' }))}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
              formData.workType === 'oral'
                ? "border-purple-400 bg-purple-50 text-purple-700 shadow-sm"
                : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 text-gray-600"
            )}
          >
            <Mic className="w-4 h-4" />
            <span className="text-sm font-medium">Oral</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, workType: 'writing' }))}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
              formData.workType === 'writing'
                ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm"
                : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 text-gray-600"
            )}
          >
            <PenLine className="w-4 h-4" />
            <span className="text-sm font-medium">Writing</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          <Select
            value={formData.classId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, classId: value, subjectId: undefined }))}
          >
            <SelectTrigger className="h-10 sm:h-9">
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
          <Label>Subject</Label>
          <Select
            value={formData.subjectId || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
          >
            <SelectTrigger className="h-10 sm:h-9">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full h-10 sm:h-9"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chapterName">Chapter / Topic</Label>
          <Input
            id="chapterName"
            value={formData.chapterName || ''}
            onChange={(e) => setFormData({ ...formData, chapterName: e.target.value })}
            placeholder="e.g. Ch-4: The Monkey and the Crocodile"
            className="w-full h-10 sm:h-9"
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
          className="min-h-[100px] sm:min-h-[120px]"
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
            className="w-full mx-auto"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Attachments</Label>
        <div className="border rounded-lg p-3 sm:p-4 bg-background">
          <FileUploader
            onFilesSelected={handleFileUpload}
            onFileDelete={handleFileDelete}
            existingFiles={formData.attachments}
            acceptedFileTypes={['image/*']}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 sticky bottom-0 bg-background pt-3 sm:pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
