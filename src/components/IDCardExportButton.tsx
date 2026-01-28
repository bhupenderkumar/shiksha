import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import exportIDCardsWithImages from '@/scripts/exportIDCards';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IDCardExportButtonProps {
  classId?: string;
  search?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const IDCardExportButton: React.FC<IDCardExportButtonProps> = ({
  classId,
  search,
  variant = 'outline',
  size = 'default',
  className = '',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startSerialNumber, setStartSerialNumber] = useState(115601);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setIsDialogOpen(false);
      toast.loading('Preparing ID cards for export...', { id: 'export-toast' });

      // Try the enhanced export with images
      try {
        await exportIDCardsWithImages({
          startSerialNumber,
          classId,
          search,
        });

        toast.success('ID cards exported successfully!', { id: 'export-toast' });
      } catch (exportError) {
        console.error('Error with enhanced export:', exportError);

        // If the enhanced export fails, fall back to the standard Excel export
        toast.loading('Enhanced export failed. Falling back to standard export...', { id: 'export-toast' });

        // Use the existing export function from idCardService
        const idCardService = await import('@/services/idCardService');
        const exportParams = {
          search: search || '',
          classId: classId || '',
          sortBy: 'created_at',
          sortOrder: 'desc' as 'asc' | 'desc'
        };

        const excelBlob = await idCardService.idCardService.exportIDCardsToExcel(exportParams);

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

        toast.success('ID cards exported with standard method (without high-quality images)', { id: 'export-toast' });
      }
    } catch (error) {
      console.error('Error exporting ID cards:', error);
      toast.error('Failed to export ID cards. Please try the standard export button.', { id: 'export-toast' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex items-center gap-1 ${className}`}
          disabled={isExporting}
        >
          <FileSpreadsheet className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export with High-Quality Images'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export ID Cards with High-Quality Images</DialogTitle>
          <DialogDescription>
            This will export ID cards with high-quality images to an Excel file and save the images separately in a ZIP file.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startSerialNumber" className="text-right">
              Start Serial #
            </Label>
            <Input
              id="startSerialNumber"
              type="number"
              value={startSerialNumber}
              onChange={(e) => setStartSerialNumber(parseInt(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <p className="text-sm text-muted-foreground">
              This will:
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Export all ID cards to Excel</li>
              <li>Download high-quality images</li>
              <li>Create admission numbers starting from {startSerialNumber}</li>
              <li>Package everything in a ZIP file</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IDCardExportButton;
