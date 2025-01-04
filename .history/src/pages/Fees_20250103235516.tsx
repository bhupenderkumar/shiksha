import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Calendar } from "@/components/ui/calendar";
import { FileUploader } from '@/components/FileUploader';
import { ImageCarousel } from '@/components/ImageCarousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Fee {
  id: string;
  student_id: string;
  amount: number;
  due_date: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  files?: FeeFile[];
}

interface FeeFile {
  id: string;
  fee_id: string;
  file_path: string;
  file_type: 'image' | 'pdf';
  file_name: string;
  uploaded_by: string;
  uploaded_at: string;
}

const Fees = () => {
  const { profile } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [allFees, setAllFees] = useState<Fee[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    amount: 0,
    due_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const isEditable = profile?.role === 'admin' || profile?.role === 'teacher';

  useEffect(() => {
    loadFees(selectedDate);
    if (isEditable) {
      loadAllFees();
    }
  }, [selectedDate, isEditable]);

  const loadFees = async (date: Date) => {
    try {
      setLoading(true);
      const dateStr = date.toISOString().split('T')[0];

      let query = supabase
        .from('fees')
        .select(`
          *,
          fee_files (
            id,
            file_path,
            file_type,
            file_name,
            uploaded_at,
            uploaded_by
          )
        `)
        .order('created_at', { ascending: false });

      if (!isEditable) {
        query = query.eq('due_date', dateStr);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setFees(data || []);
    } catch (error) {
      toast.error('Failed to load fees');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllFees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fees')
      .select(`
        *,
        fee_files (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load all fees');
      console.error(error);
    } else {
      setAllFees(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (fee: Fee) => {
    setEditingFee(fee);
    setFormData({
      student_id: fee.student_id,
      amount: fee.amount,
      due_date: fee.due_date ? new Date(fee.due_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: fee.description,
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingFee(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const feeData = {
        student_id: formData.student_id,
        amount: formData.amount,
        due_date: formData.due_date,
        description: formData.description,
        updated_at: new Date().toISOString()
      };

      const { error } = editingFee
        ? await supabase
            .from('fees')
            .update(feeData)
            .eq('id', editingFee.id)
        : await supabase
            .from('fees')
            .insert([{ ...feeData, created_by: profile?.id }]);

      if (error) throw error;

      toast.success(
        `Fee ${editingFee ? 'updated' : 'created'} successfully`
      );
      setEditingFee(null);
      resetForm();
      loadFees(selectedDate);
      if (isEditable) {
        loadAllFees();
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save fee');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fee?')) {
      return;
    }

    const { error } = await supabase.from('fees').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete fee');
      console.error(error);
    } else {
      toast.success('Fee deleted successfully');
      loadFees(selectedDate);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('fee_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
      
      loadFees(selectedDate);
      if (isEditable) {
        loadAllFees();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      amount: 0,
      due_date: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Tabs defaultValue="daily" className="w-full space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="daily">📅 Daily View</TabsTrigger>
          {isEditable && <TabsTrigger value="all">📚 All Fees</TabsTrigger>}
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
                
                {isEditable && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        resetForm();
                        setEditingFee(null);
                      }}>
                        Create New Fee
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingFee ? 'Edit Fee' : 'Create Fee'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label className="block text-sm font-medium text-gray-700">Student ID</Label>
                          <Input
                            type="text"
                            value={formData.student_id}
                            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                            required
                            placeholder="Enter student ID"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium text-gray-700">Amount</Label>
                          <Input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            required
                            placeholder="Enter amount"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium text-gray-700">Due Date</Label>
                          <Input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="block text-sm font-medium text-gray-700">Description</Label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={4}
                            placeholder="Enter description"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        {editingFee && (
                          <div className="mt-4 border-t pt-4">
                            <Label className="block text-sm font-medium text-gray-700">Fee Files</Label>
                            <FileUploader
                              feeId={editingFee.id}
                              onUploadComplete={() => loadFees(selectedDate)}
                              existingFiles={editingFee.files}
                              onFileDelete={handleDeleteFile}
                            />
                          </div>
                        )}
                        <Button type="submit" className="mt-4">
                          {editingFee ? 'Update Fee' : 'Create Fee'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : fees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No fees found for this date.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fees.map((fee) => (
                      <FeeCard
                        key={fee.id}
                        fee={fee}
                        isEditable={isEditable}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onUploadComplete={() => loadFees(selectedDate)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isEditable && (
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allFees.map((fee) => (
                    <FeeCard
                      key={fee.id}
                      fee={fee}
                      isEditable={isEditable}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onUploadComplete={loadAllFees}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

interface FeeCardProps {
  fee: Fee;
  isEditable: boolean;
  onEdit: (fee: Fee) => void;
  onDelete: (id: string) => void;
  onUploadComplete: () => void;
}

const FeeCard = ({ fee, isEditable, onEdit, onDelete, onUploadComplete }: FeeCardProps) => {
  const handleFileDelete = async (fileId: string) => {
    try {
      const file = fee.files?.find(f => f.id === fileId);
      if (!file) return;

      const { error: storageError } = await supabase.storage
        .from('fee-files')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('fee_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast.success('File deleted successfully');
      onUploadComplete();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-semibold text-primary">Fee for Student ID: {fee.student_id}</h3>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  Amount: ${fee.amount}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(fee.created_at).toLocaleDateString()}
              </p>
            </div>
            {isEditable && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(fee)}
                  className="hover:bg-primary/10"
                >
                  <span className="mr-2">✏️</span>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this fee?')) {
                      onDelete(fee.id);
                    }
                  }}
                  className="hover:bg-destructive/90"
                >
                  <span className="mr-2">🗑️</span>
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600">{fee.description}</p>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium text-orange-600">Due Date:</span>
            <span className="text-gray-600">
              {new Date(fee.due_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {fee.files && fee.files.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">Attached Files</h4>
              <ImageCarousel files={fee.files} />
            </div>
          )}

          {isEditable && (
            <div className="mt-4 border-t pt-4">
              <FileUploader
                feeId={fee.id}
                onUploadComplete={onUploadComplete}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Fees;
