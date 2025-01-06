import React, { useEffect, useState } from 'react';
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
import { loadStudents, type Student } from '@/services/studentService';
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
import { CreditCard, Download, Edit, Plus, Trash } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/api-client';
import { EmptyState } from '@/components/ui/empty-state';
import { PageAnimation, CardAnimation } from '@/components/ui/page-animation';

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
  const [fees, setFees] = useState<Fee[]>([]);
  const [pendingFeesStudents, setPendingFeesStudents] = useState<any[]>([]);
  const [loadingPendingFees, setLoadingPendingFees] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [formData, setFormData] = useState({
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    feeType: FeeType.TUITION,
    status: FeeStatus.PENDING,
    paymentMethod: '',
    receiptNumber: '',
    studentId: ''
  });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [feesData, studentsData] = await Promise.all([
          loadFees(profile?.role === 'STUDENT' ? profile.id : undefined),
          loadStudents()
        ]);
        setFees(feesData);
        setStudents(studentsData);
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

    fetchData();
  }, [isAdminOrTeacher]);

  // Download pending fees students list
  const downloadPendingFeesList = () => {
    try {
      const currentDate = new Date();
      const worksheet = XLSX.utils.json_to_sheet(
        pendingFeesStudents.map(student => ({
          'Admission Number': student.admissionNumber,
          'Student Name': student.name,
          'Class': `${student.class?.name || ''} ${student.class?.section || ''}`,
          'Contact': student.contact || 'N/A',
          'Parent Name': student.parentName || 'N/A',
          'Month': currentDate.toLocaleString('default', { month: 'long' }),
          'Year': currentDate.getFullYear(),
          'Status': 'Pending'
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pending Fees Students');

      const fileName = `pending_fees_students_${currentDate.getFullYear()}_${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.xlsx`;

      XLSX.writeFile(workbook, fileName);
      toast.success('List downloaded successfully');
    } catch (error) {
      console.error('Error downloading list:', error);
      toast.error('Failed to download list');
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
        {isAdminOrTeacher && (
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-primary/90 hover:bg-primary transition-colors duration-200"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Fee
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All Fees</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">Pending Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : fees.length === 0 ? (
            <CardAnimation className="text-center py-12">
              <div className="bg-card/50 backdrop-blur-sm border-border/50 rounded-lg p-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No fees found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isAdminOrTeacher 
                    ? "Start by creating a new fee record"
                    : "No fees have been assigned yet"}
                </p>
                {isAdminOrTeacher && (
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    variant="outline"
                    className="mt-4 hover:bg-primary/10"
                  >
                    Add your first fee
                  </Button>
                )}
              </div>
            </CardAnimation>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {fees.map((fee, index) => (
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
                <Button variant="outline" onClick={downloadPendingFeesList} disabled={pendingFeesStudents.length === 0}>
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
    </PageAnimation>
  );
};

export default Fees;