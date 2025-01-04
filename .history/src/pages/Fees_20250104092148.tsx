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
  title: string;
  description: string;
  amount: number;
  due_date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  class_id: string;
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
    title: '',
    description: '',
    amount: 0,
    due_date: new Date().toISOString().split('T')[0],
    class_id: '',
  });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState<Array<{id: string, full_name: string}>>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
      
      if (error) {
        console.error('Error fetching users:', error)
      } else {
        setUsers(data || [])
      }
    }
    if (profile?.role === 'admin' || profile?.role === 'teacher') {
      fetchUsers();
    }
  }, [profile]);

  useEffect(() => {
    loadFees(selectedDate);
    if (profile?.role === 'admin' || profile?.role === 'teacher') {
      loadAllFees();
    }
  }, [selectedDate, profile]);

  const loadFees = async (date: Date) => {
    try {
      setLoading(true);
      const dateStr = date.toISOString().split('T')[0];

      let query = supabase
        .from('fees')
        .select('*') // Removed fee_files selection
        .order('created_at', { ascending: false });

      if (profile?.role !== 'admin' && profile?.role !== 'teacher') {
        query = query.eq('due_date', dateStr);
      }

      console.log('Query:', query); // Log the query

      const { data, error } = await query;

      console.log('Response:', data); // Log the response

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
      .select('*') // Removed fee_files selection
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
      title: fee.title,
      description: fee.description,
      amount: fee.amount,
      due_date: new Date(fee.due_date).toISOString().split('T')[0],
      class_id: fee.class_id || '',
    });
    setSelectedUserId(fee.id || '');
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
        title: formData.title,
        description: formData.description,
        amount: formData.amount,
        due_date: formData.due_date,
        class_id: formData.class_id || null,
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
      if (profile?.role === 'admin' || profile?.role === 'teacher') {
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
      if (profile?.role === 'admin' || profile?.role === 'teacher') {
        loadAllFees();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      amount: 0,
      due_date: new Date().toISOString().split('T')[0],
      class_id: '',
    });
    setSelectedUserId('');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Tabs defaultValue="daily" className="w-full space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="daily">📅 Daily View</TabsTrigger>
          {(profile?.role === 'admin' || profile?.role === 'teacher') && <TabsTrigger value="all">📚 All Fees</TabsTrigger>}
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
                
                {(profile?.role === 'admin' || profile?.role === 'teacher') && (
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
                          <Label className="block text-sm font-medium text-gray-700">Title</Label>
                          <Input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="Enter title"
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
                        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
                          <div>
                            <Label className="block text-sm font-medium text-gray-700">User</Label>
                            <select
                              value={selectedUserId}
                              onChange={(e) => setSelectedUserId(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            >
                              <option value="">Select User</option>
                              {users.map(user => (
                                <option key={user.id} value={user.id}>{user.full_name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        {profile?.role !== 'admin' && profile?.role !== 'teacher' && (
                          <div>
                            <Label className="block text-sm font-medium text-gray-700">Class</Label>
                            <Input
                              type="text"
                              value={formData.class_id}
                              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                              required
                              placeholder="Enter class ID"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                          </div>
                        )}
                        {editingFee && (
                          <div className="mt-4 border-t pt-4">
                            <Label className="block text-sm font-medium text-gray-700">Fee Files</Label>
                            <FileUploader
                              assignmentId={editingFee.id}
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
                        isEditable={profile?.role === 'admin' || profile?.role === 'teacher'}
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

        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
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
                      isEditable={profile?.role === 'admin' || profile?.role === 'teacher'}
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
                <h3 className="text-xl font-semibold text-primary">{fee.title}</h3>
                
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
                assignmentId={fee.id}
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
