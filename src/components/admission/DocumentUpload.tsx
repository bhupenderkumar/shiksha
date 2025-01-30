import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Upload } from "lucide-react";

interface DocumentStatus {
  uploaded: boolean;
  verified: boolean;
  url?: string;
  remarks?: string;
}

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  onVerify: (status: "verified" | "rejected", remarks?: string) => Promise<void>;
  status: DocumentStatus;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  onVerify,
  status,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleVerification = async (verificationStatus: "verified" | "rejected") => {
    setVerifying(true);
    try {
      await onVerify(verificationStatus, remarks);
      setShowVerificationDialog(false);
      setRemarks("");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {!status.uploaded ? (
        <div className="space-y-2">
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {file && (
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          )}
        </div>
      ) : !status.verified ? (
        <div className="space-y-2">
          {status.url && (
            <a
              href={status.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline block mb-2"
            >
              View Document
            </a>
          )}
          <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Verify Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Document Verification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add verification remarks..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleVerification("verified")}
                    disabled={verifying}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify
                  </Button>
                  <Button
                    onClick={() => handleVerification("rejected")}
                    disabled={verifying}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-green-600 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Verified
          </span>
          {status.url && (
            <a
              href={status.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Document
            </a>
          )}
        </div>
      )}
      {status.remarks && (
        <div className="mt-2 text-sm text-gray-600">
          <strong>Remarks:</strong> {status.remarks}
        </div>
      )}
    </div>
  );
};
