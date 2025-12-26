import React, { useEffect, useState } from 'react';
import { useProfileAccess } from '@/services/profileService';
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
import FeeCard from '@/components/ui/FeeCard';

const Fees = () => {
  const { profile, isAdminOrTeacher, loading: profileLoading } = useProfileAccess();
  const [fees, setFees] = useState<Fee[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string; section: string; }[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string; admissionNumber?: string; photo_url?: string | null; }[]>([]);
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
        data = await feesService.getMyFees(profile!.email || '');
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
      setLoading(true);
      console.log(`Fetching students for class ID: ${classId}`);
      const data = await feesService.getStudentsByClass(classId);
      console.log(`Found ${data.length} students`);

      setStudents(data);

      if (data.length === 0) {
        toast.warning(`No students found for this class. Please check if students are assigned to this class.`);
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
        {loading ? (
          <LoadingSpinner />
        ) : fees.length === 0 ? (
          <EmptyState
            title="No Fees Found"
            description="You have no fees assigned."
            action={isAdminOrTeacher && (
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Fee
              </Button>
            )}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fees.map((fee) => (
              <FeeCard
                key={fee.id}
                fee={fee}
                onDownloadReceipt={handleDownloadReceipt}
                onEdit={(fee) => {
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
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Fees Management</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Fee
        </Button>
      </div>

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

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : fees.length === 0 ? (
        <EmptyState
          title="No Fees Found"
          description="Start by creating a new fee record"
          action={isAdminOrTeacher && (
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Fee
            </Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fees.map((fee) => (
            <FeeCard
              key={fee.id}
              fee={fee}
              onDownloadReceipt={handleDownloadReceipt}
              onEdit={(fee) => {
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
            />
          ))}
        </div>
      )}

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