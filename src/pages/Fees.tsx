import React, { useEffect, useState } from 'react';
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
import { CreditCard, Download, Edit, Plus, Trash, Filter, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/api-client';
import { EmptyState } from '@/components/ui/empty-state';
import { PageAnimation, CardAnimation } from '@/components/ui/page-animation';
import { format } from 'date-fns';

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
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [feesData, studentsData, classesData] = await Promise.all([
          loadFees(profile?.role === 'STUDENT' ? profile.id : undefined),
          studentService.findMany(),
          classService.findMany()
        ]);
        setFees(feesData);
        setFilteredFees(feesData);
        setStudents(studentsData);
        setClasses(classesData);
        if (isAdminOrTeacher) {
          await calculatePendingFeesStudents();
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [isAdminOrTeacher]);

  // Apply filters effect
  useEffect(() => {
    let filtered = [...fees];

    if (filters.startDate) {
      filtered = filtered.filter(fee => 
        new Date(fee.dueDate) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(fee => 
        new Date(fee.dueDate) <= new Date(filters.endDate)
      );
    }

    if (filters.classId) {
      filtered = filtered.filter(fee => 
        fee.student?.classId === filters.classId
      );
    }

    if (filters.studentId) {
      filtered = filtered.filter(fee => 
        fee.studentId === filters.studentId
      );
    }

    if (filters.feeType) {
      filtered = filtered.filter(fee => 
        fee.feeType === filters.feeType
      );
    }

    if (filters.status) {
      filtered = filtered.filter(fee => 
        fee.status === filters.status
      );
    }

    setFilteredFees(filtered);
  }, [fees, filters]);

  // Calculate pending fees students
  const calculatePendingFeesStudents = async () => {
    try {
      setLoadingPendingFees(true);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Get all students with their class info
      const { data: allStudents, error: studentsError } = await supabase
        .schema('school')
        .from('Student')
        .select(`
          id,
          name,
          admissionNumber,
          parentName,
          class:Class!classId (
            id,
            name,
            section
          )
        `)

      if (studentsError) throw studentsError;

      // Get all fees for the current month
      const { data: monthlyFees, error: feesError } = await supabase
        .schema('school')
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
    setShowCreateDialog(true);
  };

  const handleDelete = (fee: Fee) => {
    setSelectedFee(fee);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFee) return;
    
    try {
      setLoading(true);
      await deleteFee(selectedFee.id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!formData.studentId && !isAdminOrTeacher) {
        toast.error('Please select a student');
        return;
      }

      const feeData = {
        ...formData,
        amount: Number(formData.amount),
        dueDate: new Date(formData.dueDate),
        studentId: isAdminOrTeacher ? formData.studentId : profile!.id
      };

      if (editingFee) {
        await updateFee(editingFee.id, feeData);
        toast.success('Fee updated successfully');
      } else {
        await createFee(feeData);
        toast.success('Fee created successfully');
      }

      setShowCreateDialog(false);
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
      await fetchFeesData();
    } catch (error) {
      console.error('Error submitting fee:', error);
      toast.error('Failed to save fee');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeesData = async () => {
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

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All Fees</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">Pending Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredFees.length === 0 ? (
            <CardAnimation className="text-center py-12">
              <div className="bg-card/50 backdrop-blur-sm border-border/50 rounded-lg p-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No fees found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {Object.values(filters).some(Boolean)
                    ? "No fees match your current filters"
                    : isAdminOrTeacher 
                      ? "Start by creating a new fee record"
                      : "No fees have been assigned yet"}
                </p>
                {isAdminOrTeacher && !Object.values(filters).some(Boolean) && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    variant="outline"
                    className="mt-4 hover:bg-primary/10"
                  >
                    Add your first fee
                  </Button>
                )}
                {Object.values(filters).some(Boolean) && (
                  <Button
                    onClick={() => setFilters({
                      startDate: '',
                      endDate: '',
                      classId: '',
                      studentId: '',
                      feeType: '',
                      status: ''
                    })}
                    variant="outline"
                    className="mt-4 hover:bg-primary/10"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardAnimation>
          ) : (
            <div className="space-y-4">
              {Object.values(filters).some(Boolean) && (
                <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg mb-4">
                  <div className="flex flex-wrap gap-2">
                    {filters.startDate && (
                      <Badge variant="secondary">
                        From: {format(new Date(filters.startDate), 'PP')}
                      </Badge>
                    )}
                    {filters.endDate && (
                      <Badge variant="secondary">
                        To: {format(new Date(filters.endDate), 'PP')}
                      </Badge>
                    )}
                    {filters.classId && (
                      <Badge variant="secondary">
                        Class: {classes.find(c => c.id === filters.classId)?.name}
                      </Badge>
                    )}
                    {filters.studentId && (
                      <Badge variant="secondary">
                        Student: {students.find(s => s.id === filters.studentId)?.name}
                      </Badge>
                    )}
                    {filters.feeType && (
                      <Badge variant="secondary">
                        Type: {filters.feeType}
                      </Badge>
                    )}
                    {filters.status && (
                      <Badge variant="secondary">
                        Status: {filters.status}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({
                      startDate: '',
                      endDate: '',
                      classId: '',
                      studentId: '',
                      feeType: '',
                      status: ''
                    })}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              )}
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredFees.map((fee, index) => (
                  <CardAnimation key={fee.id} delay={index * 100}>
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={
                              fee.status === FeeStatus.PAID ? "bg-green-100" : "bg-amber-100"
                            }>
                              <CreditCard className={fee.status === FeeStatus.PAID ? "text-green-600" : "text-amber-600"} />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {fee.student?.name || 'Unknown Student'}
                              </CardTitle>
                              <CardDescription>{fee.student?.admissionNumber}</CardDescription>
                            </div>
                          </div>
                          {isAdminOrTeacher && (
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEdit(fee)}
                                className="hover:bg-primary/10"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(fee)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Amount</span>
                            <span className="text-lg font-semibold">₹{fee.amount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Type</span>
                            <span className="font-medium">{fee.feeType}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Due Date</span>
                            <span>{new Date(fee.dueDate).toLocaleDateString()}</span>
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
                              <div className="pt-3">
                                <Button
                                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary"
                                  size="sm"
                                  onClick={() => generateFeePDF(fee, fee.student)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Receipt
                                </Button>
                              </div>
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

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Pending Fees Students</CardTitle>
                  <CardDescription>
                    Students who haven't paid tuition fees for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </div>
                <Button variant="outline" disabled={pendingFeesStudents.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Download List
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPendingFees ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                  <p className="mt-2 text-sm text-muted-foreground">Loading students...</p>
                </div>
              ) : pendingFeesStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No students with pending fees for this month</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Parent Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingFeesStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.admissionNumber}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.class?.name} {student.class?.section}</TableCell>
                        <TableCell>{student.contact}</TableCell>
                        <TableCell>{student.parentName}</TableCell>
                        <TableCell>
                          <Badge variant="warning">Pending</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-background/95 backdrop-blur-lg border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {editingFee ? 'Edit Fee' : 'Add New Fee'}
            </DialogTitle>
            <DialogDescription>
              {editingFee ? 'Update the fee details below.' : 'Enter the fee details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isAdminOrTeacher && (
              <div>
                <Label>Student</Label>
                <Select
                  value={formData.studentId}
                  onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {student.admissionNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Fee Type</Label>
              <Select
                value={formData.feeType}
                onValueChange={(value) => setFormData({ ...formData, feeType: value as FeeType })}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as FeeStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
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

            {formData.status === FeeStatus.PAID && (
              <>
                <div>
                  <Label>Payment Method</Label>
                  <Input
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Receipt Number</Label>
                  <Input
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {editingFee ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="bg-background/95 backdrop-blur-lg border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Filter Fees
            </DialogTitle>
            <DialogDescription>
              Set filters to find specific fee records
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
                onValueChange={(value) => setFilters({ ...filters, classId: value })}
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
                    .filter(s => !filters.classId || s.classId === filters.classId)
                    .map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {student.admissionNumber}
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
                  setShowFilterDialog(false);
                }}
              >
                Reset
              </Button>
              <Button 
                onClick={() => setShowFilterDialog(false)}
                className="bg-primary"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageAnimation>
  );
};

export default Fees;