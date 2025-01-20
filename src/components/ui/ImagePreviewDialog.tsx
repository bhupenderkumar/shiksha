import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ImageGalleryCarousel } from './ImageGalleryCarousel';

interface ImagePreviewDialogProps {
  open: boolean;
  images: Array<{
    url: string;
    alt: string;
  }>;
  onClose: () => void;
}

export const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  open,
  images,
  onClose
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-7xl p-0 w-full">
        <div className="relative w-full h-[90vh] sm:h-[85vh] md:h-[80vh]">
          {images.length > 0 && (
            <ImageGalleryCarousel
              images={images}
              onClose={onClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};