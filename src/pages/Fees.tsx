import React, { useEffect, useState, useCallback } from 'react';
import { useProfileAccess } from '@/services/profileService';
import { toast } from 'react-hot-toast';
import { FileUploader } from '../components/FileUploader';
import { ImageCarousel } from '../components/ImageCarousel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Fee, 
  FeeType,
  FeeStatus,
  loadFees, 
  createFee, 
  updateFee, 
  deleteFee, 
  deleteFileFromFee,
  getPendingFeesStudents
} from '@/services/feeService';
import { generateFeePDF } from '@/services/pdfService';
import { studentService, type Student } from '@/services/student.service';
import { classService,  } from '@/services/classService';
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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CreditCard, Download, Edit, Plus, Trash, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/api-client';
import { EmptyState } from '@/components/ui/empty-state';
import { PageAnimation, CardAnimation } from '@/components/ui/page-animation';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  classId?: string;
}

interface Class {
  id: string;
  name: string;
  section: string;
}

interface Fee {
  id: string;
  amount: number;
  dueDate: string;
  feeType: FeeType;
  status: FeeStatus;
  studentId: string;
  description?: string;
  student?: Student;
}

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
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [filteredFees, setFilteredFees] = useState<Fee[]>([]);
  const [pendingFeesStudents, setPendingFeesStudents] = useState<any[]>([]);
  const [loadingPendingFees, setLoadingPendingFees] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    classId: '',
    studentId: '',
    feeType: '',
    status: ''
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      classId: '',
      studentId: '',
      feeType: FeeType.TUITION,
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: FeeStatus.PENDING,
      description: ''
    }
  });

  const [pendingFeesData, setPendingFeesData] = useState<{
    currentMonthPending: number;
    previousMonthsPending: number;
    totalPending: number;
  }>({
    currentMonthPending: 0,
    previousMonthsPending: 0,
    totalPending: 0,
  });

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // Calculate pending fees students
  const calculatePendingFeesStudents = async () => {
    try {
      setLoadingPendingFees(true);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Get all students with their class info
      const { data: allStudents, error: studentsError } = await supabase
        .from('Student')
        .select(`
          id,
          name,
          admissionNumber,
          parentName,
          parentEmail,
          parentContact,
          classId,
          class:Class (
            id,
            name,
            section
          )
        `);

      if (studentsError) throw studentsError;

      // Get all fees for the current month
      const { data: monthlyFees, error: feesError } = await supabase
        .from('Fee')
        .select('*')
        .eq('feeType', FeeType.TUITION)
        .gte('dueDate', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('dueDate', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)
        .eq('status', FeeStatus.PAID);

      if (feesError) throw feesError;

      // Get the list of students who have paid
      const paidStudentIds = new Set(monthlyFees?.map(fee => fee.studentId) || []);

      // Filter out students who have already paid
      const pendingStudents = allStudents?.filter(student => !paidStudentIds.has(student.id)) || [];

      setPendingFeesStudents(pendingStudents);
    } catch (error) {
      console.error('Error calculating pending fees students:', error);
      toast.error('Failed to load pending fees students');
    } finally {
      setLoadingPendingFees(false);
    }
  };

  // Update fetchFeesData with pagination and proper filtering
  const fetchFeesData = async () => {
    try {
      setLoading(true);
      
      // Calculate range for pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      // Build query based on filters
      let query = supabase
        .schema('school')
        .from('Fee')
        .select(`
          *,
          student:Student (
            id,
            name,
            admissionNumber,
            classId,
            parentName,
            parentEmail,
            parentContact,
            class:Class (
              id,
              name,
              section
            )
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.startDate) {
        query = query.gte('dueDate', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('dueDate', filters.endDate);
      }
      if (filters.feeType) {
        query = query.eq('feeType', filters.feeType);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.studentId) {
        query = query.eq('studentId', filters.studentId);
      } else if (filters.classId) {
        query = query.eq('student.classId', filters.classId);
      }

      // Apply pagination
      query = query.range(from, to);

      // If user is student, only show their fees
      if (!isAdminOrTeacher && profile?.id) {
        query = query.eq('studentId', profile.id);
      }

      const { data: feesData, error: feesError, count } = await query;

      if (feesError) throw feesError;
      
      setFees(feesData || []);
      setFilteredFees(feesData || []);
      setTotalPages(Math.ceil((count || 0) / pageSize));

    } catch (error) {
      console.error('Error fetching fees data:', error);
      toast.error('Failed to load fees data');
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to refetch when page changes
  useEffect(() => {
    if (isAdminOrTeacher !== undefined) {
      fetchFeesData();
    }
  }, [isAdminOrTeacher, currentPage, filters]); // Add currentPage and filters as dependencies

  // Add applyFilters function
  const applyFilters = async () => {
    setCurrentPage(1); // Reset to first page when filters change
    await fetchFeesData();
  };

  // Handle fee creation/update
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const feeData = {
        ...data,
        amount: Number(data.amount),
        dueDate: new Date(data.dueDate).toISOString(),
        studentId: isAdminOrTeacher ? data.studentId : profile!.id
      };

      if (editingFee) {
        const { error } = await supabase
        .schema('school')
          .from('Fee')
          .update(feeData)
          .eq('id', editingFee.id);

        if (error) throw error;
        toast.success('Fee updated successfully');
      } else {
        const { error } = await supabase
          .from('Fee')
          .insert([feeData]);

        if (error) throw error;
        toast.success('Fee created successfully');
      }

      setShowCreateDialog(false);
      setEditingFee(null);
      setValue('classId', '');
      setValue('studentId', '');
      setValue('feeType', FeeType.TUITION);
      setValue('amount', 0);
      setValue('dueDate', new Date().toISOString().split('T')[0]);
      setValue('status', FeeStatus.PENDING);
      setValue('description', '');
      await fetchFeesData();
    } catch (error) {
      console.error('Error submitting fee:', error);
      toast.error('Failed to save fee');
    } finally {
      setLoading(false);
    }
  };

  // Handle fee deletion
  const handleDeleteConfirm = async () => {
    if (!selectedFee) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('Fee')
        .delete()
        .eq('id', selectedFee.id);

      if (error) throw error;

      await fetchFeesData();
      toast.success('Fee deleted successfully');
      setShowDeleteDialog(false);
      setSelectedFee(null);
    } catch (error) {
      console.error('Error deleting fee:', error);
      toast.error('Failed to delete fee');
    } finally {
      setLoading(false);
    }
  };

  // Update the fees card to show correct totals
  const calculateTotals = useCallback(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthFees = fees.reduce((total, fee) => {
      const feeDate = new Date(fee.dueDate);
      if (feeDate.getMonth() === currentMonth && feeDate.getFullYear() === currentYear && fee.status === FeeStatus.PENDING) {
        return total + (fee.amount || 0);
      }
      return total;
    }, 0);

    const previousMonthFees = fees.reduce((total, fee) => {
      const feeDate = new Date(fee.dueDate);
      if (feeDate.getMonth() === (currentMonth - 1 + 12) % 12 && 
          (feeDate.getMonth() === 11 ? feeDate.getFullYear() === currentYear - 1 : feeDate.getFullYear() === currentYear) && 
          fee.status === FeeStatus.PENDING) {
        return total + (fee.amount || 0);
      }
      return total;
    }, 0);

    const totalPendingFees = fees.reduce((total, fee) => {
      if (fee.status === FeeStatus.PENDING) {
        return total + (fee.amount || 0);
      }
      return total;
    }, 0);

    return {
      currentMonth: currentMonthFees,
      previousMonth: previousMonthFees,
      total: totalPendingFees
    };
  }, [fees]);

  useEffect(() => {
    const totals = calculateTotals();
    setPendingFeesData({
      currentMonth: totals.currentMonth,
      previousMonth: totals.previousMonth,
      total: totals.total
    });
  }, [calculateTotals]);

  return (
    <PageAnimation className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Fees Management
        </h1>
        <div className="flex gap-2">
          {isAdminOrTeacher && (
            <>
              <Button 
                variant="outline"
                onClick={() => setShowFilterDialog(true)}
                className="bg-primary/10 hover:bg-primary/20"
              >
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-primary/90 hover:bg-primary transition-colors duration-200"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Fee
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Pending Fees Summary Cards */}
      {isAdminOrTeacher && (
        <div className="grid gap-4 mb-6 md:grid-cols-3">
          <Card className={formClasses.card}>
            <CardHeader>
              <CardTitle>Current Month Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{pendingFeesData.currentMonthPending}</p>
            </CardContent>
          </Card>
          <Card className={formClasses.card}>
            <CardHeader>
              <CardTitle>Previous Months Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{pendingFeesData.previousMonthsPending}</p>
            </CardContent>
          </Card>
          <Card className={formClasses.card}>
            <CardHeader>
              <CardTitle>Total Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">₹{pendingFeesData.totalPending}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All Fees</TabsTrigger>
          {isAdminOrTeacher && (
            <TabsTrigger value="pending" className="flex-1">Pending Fees</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredFees.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="h-12 w-12" />}
              title="No fees found"
              description={
                Object.values(filters).some(Boolean)
                  ? "No fees match your current filters"
                  : isAdminOrTeacher 
                    ? "Start by creating a new fee record"
                    : "No fees have been assigned yet"
              }
              action={
                isAdminOrTeacher && !Object.values(filters).some(Boolean) ? (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    Add your first fee
                  </Button>
                ) : Object.values(filters).some(Boolean) ? (
                  <Button
                    onClick={() => {
                      setFilters({
                        startDate: '',
                        endDate: '',
                        classId: '',
                        studentId: '',
                        feeType: '',
                        status: ''
                      });
                      applyFilters();
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                ) : null
              }
            />
          ) : (
            <div>
              <div className="flex items-center justify-between px-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, (totalPages * pageSize))} of {totalPages * pageSize} entries
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredFees.map((fee) => (
                  <CardAnimation key={fee.id}>
                    <Card className={formClasses.card}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={
                              fee.status === FeeStatus.PAID 
                                ? "bg-green-100 p-2 rounded-full" 
                                : "bg-amber-100 p-2 rounded-full"
                            }>
                              <CreditCard className={
                                fee.status === FeeStatus.PAID 
                                  ? "text-green-600 h-4 w-4" 
                                  : "text-amber-600 h-4 w-4"
                              } />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {fee.student?.name || 'Unknown Student'}
                              </CardTitle>
                              <CardDescription>
                                {fee.student?.admissionNumber}
                              </CardDescription>
                            </div>
                          </div>
                          {isAdminOrTeacher && (
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingFee(fee);
                                  setValue('classId', fee.student?.classId);
                                  setValue('studentId', fee.studentId);
                                  setValue('feeType', fee.feeType);
                                  setValue('amount', fee.amount);
                                  setValue('dueDate', new Date(fee.dueDate).toISOString().split('T')[0]);
                                  setValue('status', fee.status);
                                  setValue('description', fee.description);
                                  setShowCreateDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFee(fee);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Amount</span>
                            <span className="font-semibold">₹{fee.amount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Type</span>
                            <span>{fee.feeType}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Due Date</span>
                            <span>{format(new Date(fee.dueDate), 'PP')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge variant={fee.status === FeeStatus.PAID ? "success" : "warning"}>
                              {fee.status}
                            </Badge>
                          </div>
                          {fee.status === FeeStatus.PAID && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Payment Method</span>
                                <span>{fee.paymentMethod}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Receipt</span>
                                <span>{fee.receiptNumber}</span>
                              </div>
                              <Button
                                className="w-full mt-4"
                                variant="outline"
                                onClick={() => generateFeePDF(fee, fee.student)}
                              >
                                <Download className="mr-2 h-4 w-4" /> Download Receipt
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </CardAnimation>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {isAdminOrTeacher && (
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pending Fees Students</CardTitle>
                    <CardDescription>
                      Students who haven't paid tuition fees for {format(new Date(), 'MMMM yyyy')}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    disabled={pendingFeesStudents.length === 0}
                    onClick={() => {
                      const ws = XLSX.utils.json_to_sheet(pendingFeesStudents);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Pending Fees');
                      XLSX.writeFile(wb, `pending_fees_${format(new Date(), 'MMM_yyyy')}.xlsx`);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" /> Export List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPendingFees ? (
                  <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : pendingFeesStudents.length === 0 ? (
                  <EmptyState
                    icon={<CreditCard className="h-12 w-12" />}
                    title="No pending fees"
                    description="All students have paid their fees for this month"
                  />
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Admission No.</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Parent Email</TableHead>
                          <TableHead>Parent Phone</TableHead>
                          <TableHead>Parent Name</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingFeesStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.admissionNumber}</TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>
                              {student.class?.name} {student.class?.section}
                            </TableCell>
                            <TableCell>{student.parentEmail}</TableCell>
                            <TableCell>{student.parentContact}</TableCell>
                            <TableCell>{student.parentName}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setValue('studentId', student.id);
                                  setShowCreateDialog(true);
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" /> Add Fee
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="bg-background/95 backdrop-blur-lg border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Filter Fees
            </DialogTitle>
            <DialogDescription>
              Set filters to find specific fee records. Multiple filters can be combined.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Class</Label>
              <Select
                value={filters.classId}
                onValueChange={(value) => {
                  setFilters({ 
                    ...filters, 
                    classId: value,
                    studentId: '' // Reset student when class changes
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
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
                value={filters.studentId}
                onValueChange={(value) => setFilters({ ...filters, studentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Students</SelectItem>
                  {students
                    .filter(s => !filters.classId || (s.classId && s.classId === filters.classId))
                    .map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.admissionNumber})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fee Type</Label>
              <Select
                value={filters.feeType}
                onValueChange={(value) => setFilters({ ...filters, feeType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {Object.values(FeeType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {Object.values(FeeStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    startDate: '',
                    endDate: '',
                    classId: '',
                    studentId: '',
                    feeType: '',
                    status: ''
                  });
                  applyFilters();
                  setShowFilterDialog(false);
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
              <Button 
                onClick={() => {
                  applyFilters();
                  setShowFilterDialog(false);
                }}
                className="bg-primary"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Fee Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-background/95 backdrop-blur-lg border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {editingFee ? 'Edit Fee' : 'Create New Fee'}
            </DialogTitle>
            <DialogDescription>
              {editingFee ? 'Update the fee details below.' : 'Fill in the details to create a new fee.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Class</Label>
              <Select
                value={watch('classId')}
                onValueChange={(value) => {
                  setValue('classId', value);
                  setValue('studentId', ''); // Reset student when class changes
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
              {errors.classId && (
                <span className="text-red-500 text-sm">{errors.classId.message}</span>
              )}
            </div>

            <div>
              <Label>Student</Label>
              <Select
                value={watch('studentId')}
                onValueChange={(value) => setValue('studentId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students
                    .filter(s => !watch('classId') || (s.classId && s.classId === watch('classId')))
                    .map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.admissionNumber})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.studentId && (
                <span className="text-red-500 text-sm">{errors.studentId.message}</span>
              )}
            </div>

            <div>
              <Label>Fee Type</Label>
              <Select
                value={watch('feeType')}
                onValueChange={(value) => setValue('feeType', value as FeeType)}
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
              {errors.feeType && (
                <span className="text-red-500 text-sm">{errors.feeType.message}</span>
              )}
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                {...register('amount', {
                  valueAsNumber: true,
                })}
                placeholder="Enter amount"
              />
              {errors.amount && (
                <span className="text-red-500 text-sm">{errors.amount.message}</span>
              )}
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                {...register('dueDate')}
              />
              {errors.dueDate && (
                <span className="text-red-500 text-sm">{errors.dueDate.message}</span>
              )}
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as FeeStatus)}
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
              {errors.status && (
                <span className="text-red-500 text-sm">{errors.status.message}</span>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Input
                {...register('description')}
                placeholder="Enter description (optional)"
              />
              {errors.description && (
                <span className="text-red-500 text-sm">{errors.description.message}</span>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary">
                {editingFee ? 'Update Fee' : 'Create Fee'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this fee? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageAnimation>
  );
};

export default Fees;