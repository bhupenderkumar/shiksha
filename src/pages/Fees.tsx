import React, { useEffect, useState } from 'react';
import { useProfileAccess, useAllStudents } from '@/services/profileService';
import { toast } from 'react-hot-toast';
import { FileUploader } from '../components/FileUploader';
import { ImageCarousel } from '../components/ImageCarousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  Fee, 
  FeeType,
  FeeStatus,
  loadFees, 
  createFee, 
  updateFee, 
  deleteFee, 
  deleteFileFromFee 
} from '@/services/feeService';

const formClasses = {
  select: "w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
  input: "w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
  label: "block text-sm font-medium text-foreground mb-1",
  card: "backdrop-blur-sm bg-card/80 hover:bg-card/90 transition-all border border-border",
  button: {
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
    secondary: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
    destructive: "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
  }
};

const Fees = () => {
  const { profile, loading: profileLoading, isAdminOrTeacher } = useProfileAccess();
  const { students, loading: studentsLoading } = useAllStudents();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    feeType: FeeType.TUITION,
    status: FeeStatus.PENDING,
    paymentMethod: '',
    receiptNumber: '',
    studentId: ''
  });

  useEffect(() => {
    if (!profileLoading && profile) {
      loadFeeData();
    }
  }, [profile, profileLoading]);

  const loadFeeData = async () => {
    try {
      setLoading(true);
      const data = await loadFees(profile?.role === 'STUDENT' ? profile.id : undefined);
      setFees(data || []);
    } catch (error) {
      console.error('Error in loadFees:', error);
      toast.error('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fee: Fee) => {
    setEditingFee(fee);
    setFormData({
      amount: fee.amount,
      dueDate: new Date(fee.dueDate).toISOString().split('T')[0],
      feeType: fee.feeType,
      status: fee.status,
      paymentMethod: fee.paymentMethod || '',
      receiptNumber: fee.receiptNumber || '',
      studentId: fee.studentId
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!formData.studentId && !isAdminOrTeacher) {
        toast.error('Student ID is required');
        return;
      }

      const feeData = {
        studentId: formData.studentId || profile?.id,
        amount: formData.amount,
        dueDate: new Date(formData.dueDate),
        feeType: formData.feeType,
        status: formData.status,
        paymentMethod: formData.paymentMethod || undefined,
        receiptNumber: formData.receiptNumber || undefined
      };

      if (editingFee) {
        await updateFee(editingFee.id, feeData);
      } else {
        await createFee(feeData);
      }

      toast.success(`Fee ${editingFee ? 'updated' : 'created'} successfully`);
      handleDialogClose();
      loadFeeData();
    } catch (error) {
      toast.error('Failed to save fee');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingFee(null);
    setFormData({
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      feeType: FeeType.TUITION,
      status: FeeStatus.PENDING,
      paymentMethod: '',
      receiptNumber: '',
      studentId: ''
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Tabs defaultValue="all" className="w-full space-y-8">
        <TabsList className="grid w-full grid-cols-1 max-w-md mx-auto bg-muted/50 backdrop-blur-sm">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            📚 All Fees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className={formClasses.card}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">All Fees</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Create/Edit Fee Dialog */}
              {isAdminOrTeacher && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className={`${formClasses.button.primary} mb-6`}>
                      Create New Fee
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background/95 backdrop-blur-md border border-border">
                    <DialogHeader>
                      <DialogTitle>{editingFee ? 'Edit Fee' : 'Create Fee'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Student Selection - Only for Admin/Teacher */}
                      {isAdminOrTeacher && (
                        <div>
                          <Label className={formClasses.label}>Student</Label>
                          <select
                            value={formData.studentId}
                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            required
                            className={formClasses.select}
                          >
                            <option value="">Select Student</option>
                            {students.map(student => (
                              <option key={student.id} value={student.id}>
                                {student.name} ({student.admissionNumber})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Fee Type */}
                      <div>
                        <Label className={formClasses.label}>Fee Type</Label>
                        <select
                          value={formData.feeType}
                          onChange={(e) => setFormData({ ...formData, feeType: e.target.value as FeeType })}
                          required
                          className={formClasses.select}
                        >
                          {Object.values(FeeType).map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      {/* Amount */}
                      <div>
                        <Label className={formClasses.label}>Amount</Label>
                        <Input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                          required
                          className={formClasses.input}
                        />
                      </div>

                      {/* Due Date */}
                      <div>
                        <Label className={formClasses.label}>Due Date</Label>
                        <Input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          required
                          className={formClasses.input}
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <Label className={formClasses.label}>Status</Label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as FeeStatus })}
                          required
                          className={formClasses.select}
                        >
                          {Object.values(FeeStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      {/* Payment Details - Only show if status is PAID or PARTIAL */}
                      {(formData.status === FeeStatus.PAID || formData.status === FeeStatus.PARTIAL) && (
                        <>
                          <div>
                            <Label className={formClasses.label}>Payment Method</Label>
                            <Input
                              value={formData.paymentMethod}
                              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                              className={formClasses.input}
                            />
                          </div>
                          <div>
                            <Label className={formClasses.label}>Receipt Number</Label>
                            <Input
                              value={formData.receiptNumber}
                              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                              className={formClasses.input}
                            />
                          </div>
                        </>
                      )}

                      <Button type="submit" disabled={loading} className={formClasses.button.primary}>
                        {loading ? 'Saving...' : editingFee ? 'Update Fee' : 'Create Fee'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}

              {/* Fees List */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : fees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No fees found.</div>
              ) : (
                <div className="space-y-4">
                  {fees.map((fee) => (
                    <FeeCard
                      key={fee.id}
                      fee={fee}
                      isEditable={isAdminOrTeacher}
                      onEdit={handleEdit}
                      onDelete={async (id) => {
                        if (window.confirm('Are you sure?')) {
                          await deleteFee(id);
                          loadFeeData();
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Separate FeeCard component
const FeeCard: React.FC<{
  fee: Fee;
  isEditable: boolean;
  onEdit: (fee: Fee) => void;
  onDelete: (id: string) => void;
}> = ({ fee, isEditable, onEdit, onDelete }) => (
  <Card className={`${formClasses.card} transition-all duration-200 hover:shadow-lg`}>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{fee.feeType}</h3>
          <p className="text-sm font-medium text-primary">Amount: ₹{fee.amount}</p>
          <p className="text-sm text-muted-foreground">
            Due Date: {new Date(fee.dueDate).toLocaleDateString()}
          </p>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              fee.status === FeeStatus.PAID 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : fee.status === FeeStatus.PENDING
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
            }`}>
              {fee.status}
            </span>
          </div>
          {fee.paymentMethod && (
            <p className="text-sm text-muted-foreground">
              Payment Method: {fee.paymentMethod}
            </p>
          )}
          {fee.receiptNumber && (
            <p className="text-sm text-muted-foreground">
              Receipt: {fee.receiptNumber}
            </p>
          )}
        </div>
        {isEditable && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(fee)}
              className="hover:bg-primary/10"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(fee.id)}
              className="hover:bg-destructive/90"
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default Fees;