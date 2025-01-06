import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useProfileAccess } from '@/services/profileService';
import { ClassworkCard } from '../components/ClassworkCard';
import { 
  ClassworkType,
  loadClassworks, 
  createClasswork, 
  updateClasswork, 
  deleteClasswork 
} from '../services/classworkService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { toast } from 'react-hot-toast';

export default function ClassworkPage() {
  const { user } = useAuth();
  const { profile, isAdminOrTeacher } = useProfileAccess();
  const [classworks, setClassworks] = useState<ClassworkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClasswork, setSelectedClasswork] = useState<ClassworkType | null>(null);
  const [formData, setFormData] = useState<Omit<ClassworkType, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    date: new Date(),
    classId: '',
  });
  const [classes, setClasses] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await loadClassworks(selectedDate.toISOString());
      setClassworks(data || []);
    } catch (error) {
      toast.error('Failed to load classworks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedClasswork) {
        await updateClasswork(selectedClasswork.id, formData);
        toast.success('Classwork updated successfully');
      } else {
        await createClasswork(formData);
        toast.success('Classwork created successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Failed to save classwork');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this classwork?')) return;
    
    try {
      await deleteClasswork(id);
      toast.success('Classwork deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete classwork');
      console.error(error);
    }
  };

  const handleEdit = (classwork: ClassworkType) => {
    setSelectedClasswork(classwork);
    setFormData({
      title: classwork.title,
      description: classwork.description,
      date: new Date(classwork.date),
      classId: classwork.classId,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedClasswork(null);
    setFormData({
      title: '',
      description: '',
      date: new Date(),
      classId: '',
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Classwork</h1>
        {profile?.role === 'TEACHER' && (
          <Button onClick={() => setIsDialogOpen(true)}>
            Add New Classwork
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classworks.map((classwork) => (
          <ClassworkCard
            key={classwork.id}
            classwork={classwork}
            onEdit={isAdminOrTeacher ? handleEdit : undefined}
            onDelete={isAdminOrTeacher ? handleDelete : undefined}
          />
        ))}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedClasswork ? 'Edit Classwork' : 'Add New Classwork'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({ ...formData, date: date ?? new Date() })}
                  className="rounded-md border"
                />
              </div>

              <div>
                <Label htmlFor="class">Class</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) => setFormData({ ...formData, classId: value })}
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

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedClasswork ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
