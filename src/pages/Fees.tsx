import React, { useEffect, useState, useCallback } from 'react';
import { useProfileAccess } from '@/services/profileService';
import { feesService, Fee } from '@/services/feesService';
import { FeeStatus, FeeType, FeeFilter } from '@/types/fee';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Filter, CreditCard, X, AlertCircle, User, IndianRupee } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { generateFeePDF } from '@/services/pdfService';
import FeeCard from '@/components/ui/FeeCard';

// Interface for pending fee payments from fee_payments table
interface FeePayment {
  id: string;
  student_id: string;
  amount_received: number;
  payment_date: string;
  payment_method: string;
  balance_remaining: number;
  payment_status: 'pending' | 'partial' | 'completed';
  notes?: string;
  receipt_url: string;
  fee_month?: number;
  fee_year?: number;
  student?: {
    id: string;
    student_name: string;
    admission_number: string;
    class_id: string;
    class?: {
      id: string;
      name: string;
      section: string;
    };
  };
}

const Fees = () => {
  const { profile, isAdminOrTeacher, loading: profileLoading } = useProfileAccess();
  const [fees, setFees] = useState<Fee[]>([]);
  const [pendingPayments, setPendingPayments] = useState<FeePayment[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string; section: string; }[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string; admissionNumber?: string; photo_url?: string | null; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [deletingFee, setDeletingFee] = useState<Fee | null>(null);
  const [filter, setFilter] = useState<FeeFilter>({});
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    studentId: '',
    feeType: FeeType.TUITION,
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: FeeStatus.PENDING,
    paymentDate: '',
    paymentMethod: ''
  });

  // Fetch fees with the current filter
  const fetchFeesData = useCallback(async (currentFilter?: FeeFilter) => {
    const filterToUse = currentFilter || filter;
    try {
      setLoading(true);
      let data: Fee[];
      if (isAdminOrTeacher) {
        data = await feesService.getFeesByFilter(filterToUse) as Fee[];
      } else {
        data = await feesService.getMyFees(profile!.email || '') as Fee[];
      }
      setFees(data || []);
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  }, [filter, isAdminOrTeacher, profile]);

  // Fetch pending payments from fee_payments table
  const fetchPendingPayments = useCallback(async (currentFilter?: FeeFilter) => {
    const filterToUse = currentFilter || filter;
    try {
      setLoading(true);
      const data = await feesService.getPendingFeePayments({
        classId: filterToUse.classId,
        month: filterToUse.month,
        year: filterToUse.year
      }) as FeePayment[];
      setPendingPayments(data || []);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast.error('Failed to fetch pending fees');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (profile) {
      if (activeTab === 'pending') {
        fetchPendingPayments();
      } else {
        fetchFeesData();
      }
      if (isAdminOrTeacher) {
        fetchClasses();
      }
    }
  }, [profile, activeTab]);

  const fetchClasses = async () => {
    try {
      const data = await feesService.getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      setLoading(true);
      console.log(`Fetching students for class ID: ${classId}`);
      const data = await feesService.getStudentsByClass(classId);
      console.log(`Found ${data.length} students`);

      setStudents(data);

      if (data.length === 0) {
        toast('No students found for this class. Please check if students are assigned to this class.', { icon: '⚠️' });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students. Please try again or select a different class.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Build fee data with correct types
      const feeData: any = {
        studentId: isAdminOrTeacher ? formData.studentId : profile!.id,
        feeType: formData.feeType,
        amount: Number(formData.amount),
        dueDate: new Date(formData.dueDate).toISOString(),
        status: formData.status
      };

      // Add payment details if status is PAID
      if (formData.status === FeeStatus.PAID) {
        feeData.paymentDate = formData.paymentDate 
          ? new Date(formData.paymentDate).toISOString() 
          : new Date().toISOString();
        feeData.paymentMethod = formData.paymentMethod || 'Cash';
      } else {
        feeData.paymentDate = null;
        feeData.paymentMethod = null;
      }

      if (editingFee) {
        await feesService.updateFee(editingFee.id, feeData);
        toast.success('Fee updated successfully');
      } else {
        await feesService.createFee(feeData);
        toast.success('Fee created successfully');
      }

      setShowCreateDialog(false);
      setEditingFee(null);
      resetForm();
      await fetchFeesData();
    } catch (error) {
      console.error('Error submitting fee:', error);
      toast.error('Failed to save fee');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFee) return;
    
    try {
      setLoading(true);
      await feesService.deleteFee(deletingFee.id);
      toast.success('Fee deleted successfully');
      setDeletingFee(null);
      await fetchFeesData();
    } catch (error) {
      console.error('Error deleting fee:', error);
      toast.error('Failed to delete fee');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      feeType: FeeType.TUITION,
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: FeeStatus.PENDING,
      paymentDate: '',
      paymentMethod: ''
    });
  };

  const handleFilter = async (newFilter: Partial<FeeFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    // Pass the updated filter directly to avoid stale closure issue
    if (activeTab === 'pending') {
      await fetchPendingPayments(updatedFilter);
    } else {
      await fetchFeesData(updatedFilter);
    }
  };

  const clearFilters = () => {
    setFilter({});
    if (activeTab === 'pending') {
      fetchPendingPayments({});
    } else {
      fetchFeesData({});
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFilter({});
    if (tab === 'pending') {
      fetchPendingPayments({});
    } else {
      fetchFeesData({});
    }
  };

  const handleDownloadReceipt = async (fee: Fee) => {
    try {
      const studentDetails = {
        ...fee,
        name: fee.student?.name || 'N/A',
        class: `${fee.student?.class?.name || ''} ${fee.student?.class?.section || ''}`.trim() || 'N/A',
        admissionNumber: fee.student?.admissionNumber || 'N/A'
      };
      await generateFeePDF(fee, studentDetails);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  if (profileLoading) {
    return <LoadingSpinner />;
  }

  if (!isAdminOrTeacher) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">My Fees</h1>
        {loading ? (
          <LoadingSpinner />
        ) : fees.length === 0 ? (
          <EmptyState
            title="No Fees Found"
            description="You have no fees assigned."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fees.map((fee) => (
              <FeeCard
                key={fee.id}
                fee={fee}
                onDownloadReceipt={handleDownloadReceipt}
                onEdit={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Helper to set form data when editing
  const handleEdit = (fee: Fee) => {
    setEditingFee(fee);
    // Load students for the class if available
    if (fee.student?.classId) {
      setFilter(prev => ({ ...prev, classId: fee.student?.classId }));
      fetchStudents(fee.student.classId);
    }
    setFormData({
      studentId: fee.studentId,
      feeType: fee.feeType,
      amount: fee.amount,
      dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
      status: fee.status,
      paymentDate: fee.paymentDate ? new Date(fee.paymentDate).toISOString().split('T')[0] : '',
      paymentMethod: fee.paymentMethod || ''
    });
    setShowCreateDialog(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Fees Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Fee
        </Button>
      </div>

      {/* Tabs for All Fees and Pending Fees */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            All Fees
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Pending Fees
            {pendingPayments.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingPayments.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card className="p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                value={filter.classId}
                onValueChange={(value) => handleFilter({ classId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="text"
                placeholder="Student ID"
                onChange={(e) => handleFilter({ studentId: e.target.value })}
              />

              <Select
                value={filter.status}
                onValueChange={(value) => handleFilter({ status: value as FeeStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FeeStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="month"
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month] = e.target.value.split('-');
                    handleFilter({
                      year: parseInt(year),
                      month: parseInt(month) - 1
                    });
                  }
                }}
              />
              
              {/* Clear filters button */}
              {(filter.classId || filter.studentId || filter.status || filter.month !== undefined) && (
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-1">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          ) : fees.length === 0 ? (
            <EmptyState
              title="No Fees Found"
              description="Start by creating a new fee record or adjust your filters"
              action={
                <Button onClick={() => setShowCreateDialog(true)}>
                  Create Fee
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fees.map((fee) => (
                <FeeCard
                  key={fee.id}
                  fee={fee}
                  onDownloadReceipt={handleDownloadReceipt}
                  onEdit={handleEdit}
                  onDelete={(fee) => setDeletingFee(fee)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card className="p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4" />
              <h2 className="text-lg font-semibold">Filter Pending Fees</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={filter.classId}
                onValueChange={(value) => handleFilter({ classId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="month"
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month] = e.target.value.split('-');
                    handleFilter({
                      year: parseInt(year),
                      month: parseInt(month) - 1
                    });
                  }
                }}
              />
              
              {(filter.classId || filter.month !== undefined) && (
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-1">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>

          {/* Pending Fees Summary */}
          {pendingPayments.length > 0 && (
            <Card className="p-4 mb-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold text-amber-800 dark:text-amber-200">
                    Total Pending: {pendingPayments.length} students
                  </span>
                </div>
                <div className="text-lg font-bold text-amber-800 dark:text-amber-200">
                  ₹{pendingPayments.reduce((sum, p) => sum + Number(p.balance_remaining), 0).toLocaleString('en-IN')}
                </div>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          ) : pendingPayments.length === 0 ? (
            <EmptyState
              title="No Pending Fees"
              description="All fee payments are up to date! 🎉"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPayments.map((payment) => (
                <PendingFeeCard key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFee ? 'Edit Fee' : 'Create Fee'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <>
              <div>
                <Label>Class</Label>
                <Select
                  value={filter.classId}
                  onValueChange={(value) => {
                    setFilter(prev => ({ ...prev, classId: value }));
                    fetchStudents(value);
                    setFormData(prev => ({ ...prev, studentId: '' }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Student</Label>
                <Select
                  value={formData.studentId}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, studentId: value }))
                  }
                  disabled={!filter.classId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.length === 0 ? (
                      <div className="p-2 text-center text-sm text-gray-500">
                        No students found for this class
                      </div>
                    ) : (
                      students.map((student) => (
                        <SelectItem key={student.id} value={student.id} className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            {student.photo_url ? (
                              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                                <img
                                  src={student.photo_url}
                                  alt={student.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // If image fails to load, replace with placeholder
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.style.display = 'none';
                                  }}
                                  crossOrigin="anonymous"
                                />
                              </div>
                            ) : null}
                            <span>
                              {student.name} {student.admissionNumber ? `(${student.admissionNumber})` : ''}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {filter.classId && students.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No students found for this class. Please select a different class.
                  </p>
                )}
              </div>
            </>

            <div>
              <Label>Fee Type</Label>
              <Select
                value={formData.feeType}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, feeType: value as FeeType }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Fee Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FeeType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))
                }
                min={0}
                required
              />
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, dueDate: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, status: value as FeeStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FeeStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Show payment fields when status is PAID */}
            {formData.status === FeeStatus.PAID && (
              <>
                <div>
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, paymentDate: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, paymentMethod: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingFee(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingFee ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFee} onOpenChange={(open) => !open && setDeletingFee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this fee record for{' '}
              <strong>{deletingFee?.student?.name || 'this student'}</strong>?
              <br />
              Amount: <strong>₹{deletingFee?.amount?.toLocaleString('en-IN')}</strong>
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Component for displaying pending fee payment cards
const PendingFeeCard = ({ payment }: { payment: FeePayment }) => {
  const getStatusBadge = () => {
    if (payment.payment_status === 'partial') {
      return <Badge variant="warning" className="bg-yellow-100 text-yellow-800">Partial</Badge>;
    }
    return <Badge variant="destructive">Pending</Badge>;
  };

  const getMonthYear = () => {
    if (payment.fee_month && payment.fee_year) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[payment.fee_month - 1]} ${payment.fee_year}`;
    }
    return format(new Date(payment.payment_date), 'MMM yyyy');
  };

  return (
    <Card className="overflow-hidden border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              {payment.student?.student_name || 'Unknown Student'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {payment.student?.admission_number || 'N/A'}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Class</span>
          <span className="font-medium">
            {payment.student?.class 
              ? `${payment.student.class.name} ${payment.student.class.section}` 
              : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Fee Month</span>
          <span className="font-medium">{getMonthYear()}</span>
        </div>
        {payment.payment_status === 'partial' && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Paid</span>
            <span className="font-medium text-green-600">
              ₹{Number(payment.amount_received).toLocaleString('en-IN')}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm font-semibold flex items-center gap-1">
            <IndianRupee className="h-4 w-4" />
            Balance Due
          </span>
          <span className="font-bold text-lg text-red-600">
            ₹{Number(payment.balance_remaining).toLocaleString('en-IN')}
          </span>
        </div>
        {payment.notes && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            {payment.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Fees;