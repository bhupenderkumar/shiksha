import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IDCardData, ClassOption } from '@/types/idCard';
import { idCardService } from '@/backend/idCardService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Download, Edit, Save, X, Eye, Trash2 } from 'lucide-react';
import { IDCardGenerator } from './IDCardGenerator';

interface IDCardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  idCardId: string | null;
  onUpdate: () => void;
  onDelete?: (id: string) => void;
}

const IDCardDetailModal: React.FC<IDCardDetailModalProps> = ({
  isOpen,
  onClose,
  idCardId,
  onUpdate,
  onDelete
}) => {
  const [idCard, setIdCard] = useState<IDCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<IDCardData>>({});
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [activeTab, setActiveTab] = useState('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch ID card data when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen && idCardId) {
        try {
          setLoading(true);
          const data = await idCardService.getIDCardById(idCardId);
          setIdCard(data);
          setEditedData({
            studentName: data?.studentName,
            fatherName: data?.fatherName,
            motherName: data?.motherName,
            fatherMobile: data?.fatherMobile,
            motherMobile: data?.motherMobile,
            address: data?.address,
            dateOfBirth: data?.dateOfBirth
          });

          // Fetch classes for dropdown
          const classList = await idCardService.getClassList();
          setClasses(classList);
        } catch (error) {
          console.error('Error fetching ID card:', error);
          toast.error('Failed to load ID card details');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isOpen, idCardId]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  // Handle class change
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditedData(prev => ({ ...prev, classId: e.target.value }));
  };

  // Save changes
  const handleSave = async () => {
    if (!idCard || !idCardId) return;

    try {
      await idCardService.updateIDCardData(idCardId, editedData);
      toast.success('ID card updated successfully');
      setIsEditing(false);
      onUpdate(); // Refresh the parent component

      // Refresh the current data
      const updatedData = await idCardService.getIDCardById(idCardId);
      setIdCard(updatedData);
    } catch (error) {
      console.error('Error updating ID card:', error);
      toast.error('Failed to update ID card');
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    // If switching to edit mode, make sure we're on the view tab
    if (!isEditing) {
      setActiveTab('view');
    }
  };

  // Handle download
  const handleDownload = () => {
    if (idCard && idCardId) {
      // Increment download count
      idCardService.incrementDownloadCount(idCardId);

      // Open ID card in a new tab for download
      window.open(`/id-card?id=${idCardId}`, '_blank');
    }
  };

  // Handle delete
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!idCard || !idCardId) return;

    try {
      await idCardService.deleteIDCard(idCardId);
      toast.success('ID card deleted successfully');
      setIsDeleteDialogOpen(false);
      onClose();
      if (onDelete) {
        onDelete(idCardId);
      } else {
        onUpdate(); // Fallback to update if onDelete not provided
      }
    } catch (error) {
      console.error('Error deleting ID card:', error);
      toast.error('Failed to delete ID card');
    }
  };

  if (!isOpen) return null;

  return (
    <><Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ID Card Details</DialogTitle>
          <DialogDescription>
            View and manage student ID card information
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !idCard ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">ID card not found</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">View Details</TabsTrigger>
              <TabsTrigger value="preview">ID Card Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Student Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name</Label>
                    {isEditing ? (
                      <Input
                        id="studentName"
                        name="studentName"
                        value={editedData.studentName || ''}
                        onChange={handleInputChange} />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/30">{idCard.studentName}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    {isEditing ? (
                      <select
                        id="class"
                        name="classId"
                        value={editedData.classId || idCard.classId}
                        onChange={handleClassChange}
                        className="w-full p-2 border rounded-md"
                      >
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} {cls.section}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/30">
                        {idCard.className} {idCard.section}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={editedData.dateOfBirth || ''}
                        onChange={handleInputChange} />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/30">
                        {idCard.dateOfBirth ? format(new Date(idCard.dateOfBirth), 'dd MMM yyyy') : 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentPhoto">Student Photo</Label>
                    <div className="p-2 border rounded-md bg-muted/30 flex justify-center">
                      {typeof idCard.studentPhoto === 'string' && idCard.studentPhoto ? (
                        <img
                          src={idCard.studentPhoto}
                          alt="Student"
                          className="w-32 h-32 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=No+Photo';
                          } } />
                      ) : (
                        <div className="w-32 h-32 bg-muted flex items-center justify-center rounded-md">
                          No photo
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parent Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Parent Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father's Name</Label>
                    {isEditing ? (
                      <Input
                        id="fatherName"
                        name="fatherName"
                        value={editedData.fatherName || ''}
                        onChange={handleInputChange} />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/30">{idCard.fatherName}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motherName">Mother's Name</Label>
                    {isEditing ? (
                      <Input
                        id="motherName"
                        name="motherName"
                        value={editedData.motherName || ''}
                        onChange={handleInputChange} />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/30">{idCard.motherName}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fatherMobile">Father's Mobile</Label>
                    {isEditing ? (
                      <Input
                        id="fatherMobile"
                        name="fatherMobile"
                        value={editedData.fatherMobile || ''}
                        onChange={handleInputChange} />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/30">{idCard.fatherMobile}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motherMobile">Mother's Mobile</Label>
                    {isEditing ? (
                      <Input
                        id="motherMobile"
                        name="motherMobile"
                        value={editedData.motherMobile || ''}
                        onChange={handleInputChange} />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/30">{idCard.motherMobile}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    name="address"
                    value={editedData.address || ''}
                    onChange={handleInputChange} />
                ) : (
                  <div className="p-2 border rounded-md bg-muted/30">{idCard.address}</div>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="ml-2">
                    {idCard.createdAt ? format(new Date(idCard.createdAt), 'dd MMM yyyy') : 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Downloads:</span>
                  <span className="ml-2">{idCard.downloadCount || 0}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="py-4">
              {idCard && idCardId && (
                <IDCardGenerator data={idCard} idCardId={idCardId} />
              )}
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            {!loading && idCard && (
              <>
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={toggleEditMode}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={toggleEditMode}
                      data-edit-button
                      className="mr-2"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex gap-2">
            {!loading && idCard && (
              <Button variant="default" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download ID Card
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog><AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this ID card?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ID card for
              <span className="font-semibold"> {idCard?.studentName}</span> and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog></>
  );
};

export default IDCardDetailModal;
