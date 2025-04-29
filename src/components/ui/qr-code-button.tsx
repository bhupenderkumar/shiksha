import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

interface QRCodeButtonProps {
  url: string;
  title?: string;
  description?: string;
  className?: string;
}

export function QRCodeButton({
  url,
  title = 'Scan QR Code',
  description = 'Scan this QR code with your mobile device to open the exercise',
  className = '',
}: QRCodeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get the full URL including the host
  const getFullUrl = () => {
    const baseUrl = window.location.origin;
    // If the URL starts with a slash, it's a relative URL
    if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    }
    // Otherwise, use the URL as is
    return url;
  };
  
  const fullUrl = getFullUrl();
  
  // Generate QR code URL using a free QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}`;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className}
        >
          <QrCode className="h-4 w-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <img 
            src={qrCodeUrl} 
            alt="QR Code" 
            className="w-48 h-48 border rounded-md"
          />
          <p className="mt-4 text-sm text-gray-500 text-center break-all">
            {fullUrl}
          </p>
        </div>
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default QRCodeButton;
