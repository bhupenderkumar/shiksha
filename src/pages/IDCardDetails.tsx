import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileAccess } from '@/services/profileService';
import { idCardService, IDCardListParams } from '@/backend/idCardService';
import { IDCardData } from '@/types/idCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { toast } from 'react-hot-toast';
import { Search, Download, Eye, ArrowUpDown, Edit, Trash2, Phone, MapPin, FileDown, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import IDCardDetailModal from '@/components/IDCardDetailModal';
import IDCardExportButton from '@/components/IDCardExportButton';

const IDCardDetails: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isAdmin, loading: profileLoading } = useProfileAccess();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [idCards, setIdCards] = useState<IDCardData[]>([]);
  const [totalIdCards, setTotalIdCards] = useState(0);
  const [classes, setClasses] = useState<{ id: string; name: string; section: string }[]>([]);
  const [searchParams, setSearchParams] = useState<IDCardListParams>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
    search: '',
    classId: ''
  });

  // For the UI select component
  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  // Fetch ID cards on component mount and when search params change
  useEffect(() => {
    const fetchIdCards = async () => {
      try {
        setLoading(true);
        const result = await idCardService.getAllIDCards(searchParams);
        setIdCards(result.idCards);
        setTotalIdCards(result.total);
      } catch (error) {
        console.error('Error fetching ID cards:', error);
        toast.error('Failed to fetch ID cards');
      } finally {
        setLoading(false);
      }
    };

    fetchIdCards();
  }, [searchParams]);

  // Fetch classes for filter dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classList = await idCardService.getClassList();
        setClasses(classList);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to fetch classes');
      }
    };

    fetchClasses();
  }, []);

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!profileLoading && !isAdmin) {
      toast.error('You do not have permission to access this page');
      navigate('/dashboard');
    }
  }, [profileLoading, isAdmin, navigate]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  // Handle class filter change
  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
    setSearchParams(prev => ({
      ...prev,
      classId: value === 'all' ? '' : value,
      page: 1
    }));
  };

  // Handle sort change
  const handleSortChange = (column: string) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  // State for modal and delete dialog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIdCardId, setSelectedIdCardId] = useState<string | null>(null);
  const [deletingIdCard, setDeletingIdCard] = useState<IDCardData | null>(null);

  // View ID card details
  const handleViewIdCard = (id: string) => {
    setSelectedIdCardId(id);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedIdCardId(null);
  };

  // Handle ID card update
  const handleIdCardUpdate = () => {
    // Refresh the ID cards list
    fetchIdCards();
  };

  // Fetch ID cards function
  const fetchIdCards = async () => {
    try {
      setLoading(true);
      const result = await idCardService.getAllIDCards(searchParams);
      setIdCards(result.idCards);
      setTotalIdCards(result.total);
    } catch (error) {
      console.error('Error fetching ID cards:', error);
      toast.error('Failed to fetch ID cards');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete ID card
  const handleDeleteClick = (idCard: IDCardData) => {
    setDeletingIdCard(idCard);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete ID card
  const confirmDelete = async () => {
    if (!deletingIdCard?.id) return;

    try {
      await idCardService.deleteIDCard(deletingIdCard.id);
      // Refresh the ID cards list
      fetchIdCards();
      setIsDeleteDialogOpen(false);
      setDeletingIdCard(null);
    } catch (error) {
      console.error('Error deleting ID card:', error);
    }
  };

  // Handle download all ID cards as PDF
  const handleDownloadAll = async () => {
    try {
      setDownloading(true);
      toast.loading('Preparing ID cards for download...', { id: 'download-toast' });

      // Get current filter parameters
      const exportParams: IDCardListParams = {
        search: searchParams.search,
        classId: searchParams.classId,
        sortBy: searchParams.sortBy,
        sortOrder: searchParams.sortOrder
      };

      // Export all ID cards with the current filters
      const pdfBlob = await idCardService.exportAllIDCards(exportParams);

      // Create a download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ID_Cards_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success('ID cards downloaded successfully', { id: 'download-toast' });
    } catch (error) {
      console.error('Error downloading ID cards:', error);
      toast.error('Failed to download ID cards', { id: 'download-toast' });
    } finally {
      setDownloading(false);
    }
  };

  // Handle download all ID cards as Excel
  const handleDownloadAllExcel = async () => {
    try {
      setDownloadingExcel(true);
      toast.loading('Preparing Excel file for download...', { id: 'excel-download-toast' });

      // Get current filter parameters
      const exportParams: IDCardListParams = {
        search: searchParams.search,
        classId: searchParams.classId,
        sortBy: searchParams.sortBy,
        sortOrder: searchParams.sortOrder
      };

      // Export all ID cards to Excel with the current filters
      const excelBlob = await idCardService.exportIDCardsToExcel(exportParams);

      // Create a download link
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ID_Cards_Excel_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success('Excel file downloaded successfully', { id: 'excel-download-toast' });
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      toast.error('Failed to download Excel file', { id: 'excel-download-toast' });
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalIdCards / (searchParams.limit || 10));

  // Render pagination controls
  const renderPagination = () => {
    const currentPage = searchParams.page || 1;

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber = i + 1;
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={pageNumber === currentPage}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {totalPages > 5 && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Render thumbnail image
  const renderThumbnail = (url: string | File) => {
    if (!url || typeof url !== 'string') return 'N/A';

    // Create a data URL for a placeholder image
    const createPlaceholderDataUrl = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Fill with light gray
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 40, 40);

        // Add text
        ctx.fillStyle = '#999999';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('N/A', 20, 24);
      }
      return canvas.toDataURL();
    };

    return (
      <div className="relative w-10 h-10 overflow-hidden rounded-full">
        <img
          src={url}
          alt="Photo"
          className="object-cover w-full h-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = createPlaceholderDataUrl();
          }}
        />
      </div>
    );
  };

  if (profileLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>ID Card Details</CardTitle>
            <CardDescription>
              View and manage all student ID cards
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
              onClick={handleDownloadAll}
              disabled={downloading || totalIdCards === 0}
            >
              <FileDown className="h-4 w-4" />
              {downloading ? 'Preparing PDF...' : 'Download All (PDF)'}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200"
              onClick={handleDownloadAllExcel}
              disabled={downloadingExcel || totalIdCards === 0}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {downloadingExcel ? 'Preparing Excel...' : 'Download All (Excel)'}
            </Button>
            <IDCardExportButton
              classId={searchParams.classId}
              search={searchParams.search}
              variant="outline"
              className="flex items-center gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 border-purple-200"
            />
            <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-md font-medium flex items-center">
              <span className="text-xs mr-1">Total Records:</span>
              <span className="text-lg font-bold">{totalIdCards}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, parent name, or address..."
                className="pl-8"
                value={searchParams.search}
                onChange={handleSearchChange}
              />
            </div>
            <Select
              value={selectedClassId}
              onValueChange={handleClassChange}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ID Cards Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : idCards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No ID cards found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <caption className="mt-2 text-sm text-muted-foreground text-left">
                  Total of {totalIdCards} ID card{totalIdCards !== 1 ? 's' : ''} in the database.
                </caption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Photo</TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSortChange('student_name')}
                      >
                        Student Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSortChange('class_id')}
                      >
                        Class
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSortChange('date_of_birth')}
                      >
                        Date of Birth
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Father's Name</TableHead>
                    <TableHead>Mother's Name</TableHead>
                    <TableHead>Father's Mobile</TableHead>
                    <TableHead>Mother's Mobile</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSortChange('created_at')}
                      >
                        Created
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {idCards.map((idCard) => (
                    <TableRow key={idCard.id}>
                      <TableCell>
                        {renderThumbnail(idCard.studentPhoto)}
                      </TableCell>
                      <TableCell className="font-medium">{idCard.studentName}</TableCell>
                      <TableCell>{idCard.className} {idCard.section}</TableCell>
                      <TableCell>
                        {idCard.dateOfBirth ? format(new Date(idCard.dateOfBirth), 'dd MMM yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderThumbnail(idCard.fatherPhoto)}
                          <span>{idCard.fatherName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderThumbnail(idCard.motherPhoto)}
                          <span>{idCard.motherName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-blue-500" />
                          <span>{idCard.fatherMobile}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-pink-500" />
                          <span>{idCard.motherMobile}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={idCard.address}>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{idCard.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {idCard.createdAt ? format(idCard.createdAt, 'dd MMM yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewIdCard(idCard.id || '')}
                            className="mr-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleViewIdCard(idCard.id || '');
                              // Set active tab to edit mode
                              setTimeout(() => {
                                const editButton = document.querySelector('[data-edit-button]') as HTMLButtonElement;
                                if (editButton) editButton.click();
                              }, 100);
                            }}
                            className="mr-1"
                            title="Edit Details"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(idCard)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete ID Card"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination and Record Count */}
          {!loading && idCards.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{idCards.length}</span> of <span className="font-medium">{totalIdCards}</span> records
              </div>
              <div>
                {renderPagination()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ID Card Detail Modal */}
      <IDCardDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        idCardId={selectedIdCardId}
        onUpdate={handleIdCardUpdate}
        onDelete={(id) => {
          // After deletion in the modal, refresh the list
          fetchIdCards();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this ID card?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ID card for
              <span className="font-semibold"> {deletingIdCard?.studentName}</span> and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingIdCard(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IDCardDetails;
