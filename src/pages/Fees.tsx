import React, { useEffect, useState } from 'react';
import { useProfile } from '@/services/profileService';
import { feesService, Fee, FeeFilter } from '@/services/feesService';
import { FeeStatus, FeeType } from '@/types/fee';
import { toast } from 'react-hot-toast';
import { Card } from '@/components/ui/card';
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
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Filter, CreditCard } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { generateFeePDF } from '@/services/pdfService';

const Fees = () => {
  const { profile, loading: profileLoading } = useProfile();
  const [fees, setFees] = useState<Fee[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string; section: string; }[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string; admissionNumber: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [filter, setFilter] = useState<FeeFilter>({});
  const [formData, setFormData] = useState({
    studentId: '',
    feeType: FeeType.TUITION,
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: FeeStatus.PENDING
  });

  const isAdminOrTeacher = profile?.role === 'ADMIN' || profile?.role === 'TEACHER' || profile?.role === 'STUDENT';

  useEffect(() => {
    if (profile) {
      fetchFeesData();
      if (isAdminOrTeacher) {
        fetchClasses();
      }
    }
  }, [profile]);

  const fetchFeesData = async () => {
    try {
      setLoading(true);
      let data;
      if (isAdminOrTeacher) {
        data = await feesService.getFeesByFilter(filter);
      } else {
        data = await feesService.getFeesByStudent(profile!.id);
      }
      setFees(data);
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  };

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
      const data = await feesService.getStudentsByClass(classId);
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const feeData = {
        ...formData,
        amount: Number(formData.amount),
        dueDate: new Date(formData.dueDate).toISOString(),
        studentId: isAdminOrTeacher ? formData.studentId : profile!.id
      };

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

  const resetForm = () => {
    setFormData({
      studentId: '',
      feeType: FeeType.TUITION,
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: FeeStatus.PENDING
    });
  };

  const handleFilter = async (newFilter: Partial<FeeFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    await fetchFeesData();
  };

  const handleDownloadReceipt = async (fee: Fee) => {
    try {
      const studentDetails = {
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Fees Management</h1>
        {isAdminOrTeacher && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Fee
          </Button>
        )}
      </div>

      {isAdminOrTeacher && (
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
                const [year, month] = e.target.value.split('-');
                handleFilter({
                  year: parseInt(year),
                  month: parseInt(month) - 1
                });
              }}
            />
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : fees.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-12 w-12" />}
          title="No fees found"
          description={
            Object.values(filter).some(Boolean)
              ? "No fees match your current filters"
              : isAdminOrTeacher 
                ? "Start by creating a new fee record"
                : "No fees have been assigned yet"
          }
          action={
            isAdminOrTeacher && !Object.values(filter).some(Boolean) ? (
              <Button
                onClick={() => setShowCreateDialog(true)}
                variant="outline"
                className="mt-4"
              >
                Add your first fee
              </Button>
            ) : Object.values(filter).some(Boolean) ? (
              <Button
                onClick={() => {
                  setFilter({});
                  fetchFeesData();
                }}
                variant="outline"
                className="mt-4"
              >
                Clear Filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fees.map((fee) => (
            <Card key={fee.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{fee.student?.name}</h3>
                  <p className="text-sm text-gray-600">
                    {fee.student?.class?.name} {fee.student?.class?.section}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded text-sm ${
                  fee.status === FeeStatus.PAID ? 'bg-green-100 text-green-800' :
                  fee.status === FeeStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {fee.status}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-lg font-semibold">₹{fee.amount}</p>
                <p className="text-sm text-gray-600">
                  Due: {format(new Date(fee.dueDate), 'dd MMM yyyy')}
                </p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">Due: {format(new Date(fee.dueDate), 'dd MMM yyyy')}</p>
                {fee.status === FeeStatus.PAID && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReceipt(fee)}
                  >
                    Download Receipt
                  </Button>
                )}
              </div>
              {isAdminOrTeacher && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingFee(fee);
                      setFormData({
                        studentId: fee.studentId,
                        feeType: fee.feeType,
                        amount: fee.amount,
                        dueDate: new Date(fee.dueDate).toISOString().split('T')[0],
                        status: fee.status,
                      });
                      setShowCreateDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFee ? 'Edit Fee' : 'Create Fee'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isAdminOrTeacher && (
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
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.admissionNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

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
              <Label>Amount</Label>
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
    </div>
  );
};

export default Fees;