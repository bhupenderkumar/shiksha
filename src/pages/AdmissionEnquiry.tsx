import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  Save,
  Plus,
  MessageCircle,
  Calendar,
  Phone,
  Mail,
  School,
  User,
  FileText,
} from "lucide-react";
import { AdmissionEnquiryForm } from "@/components/admission/AdmissionEnquiryForm";
import { admissionService } from "@/services/admissionService";
import { ProspectiveStudent, EnquiryStatus, RequiredDocument } from "@/types/admission";
import { ProcessTimeline } from "@/components/admission/ProcessTimeline";
import { FileUpload } from "@/components/ui/file-upload";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { REQUIRED_DOCUMENTS } from "@/lib/constants";

interface Note {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
}

interface Communication {
  id: string;
  message: string;
  type: 'email' | 'phone' | 'in_person';
  direction: 'incoming' | 'outgoing';
  communicationDate: Date;
  createdAt: Date;
}

function DocumentUploadSection({
  prospectiveStudentId,
  documents,
  onDocumentUpload
}: {
  prospectiveStudentId: string;
  documents: Record<RequiredDocument, DocumentStatus>;
  onDocumentUpload: () => void;
}) {
  const [selectedDocType, setSelectedDocType] = useState<RequiredDocument | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!selectedDocType) return;
    setUploading(true);
    try {
      await admissionService.uploadDocument(prospectiveStudentId, file, selectedDocType);
      onDocumentUpload();
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      setSelectedDocType(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label>Document Type</Label>
        <Select
          value={selectedDocType || ""}
          onValueChange={(value) => setSelectedDocType(value as RequiredDocument)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            {REQUIRED_DOCUMENTS.map((docType) => (
              <SelectItem key={docType} value={docType}>
                {docType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDocType && (
        <FileUpload
          onUpload={handleFileUpload}
          loading={uploading}
          accept=".pdf,.jpg,.jpeg,.png"
        />
      )}

      <div className="space-y-2">
        {Object.entries(documents).map(([docType, status]) => (
          <div key={docType} className="flex items-center justify-between p-2 border rounded">
            <span>{docType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
            <Badge variant={status.submitted.length > 0 ? "success" : "secondary"}>
              {status.submitted.length > 0 ? "Submitted" : "Pending"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdmissionEnquiry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState<ProspectiveStudent | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [communicationType, setCommunicationType] = useState<'email' | 'phone' | 'in_person'>('email');
  const [documents, setDocuments] = useState<Record<RequiredDocument, DocumentStatus>>(() => {
    const initial: Record<RequiredDocument, DocumentStatus> = {} as Record<RequiredDocument, DocumentStatus>;
    REQUIRED_DOCUMENTS.forEach(doc => {
      initial[doc] = {
        required: [doc],
        submitted: [],
        verificationStatus: {},
        rejectionReason: {}
      };
    });
    return initial;
  });

  useEffect(() => {
    if (id) {
      fetchEnquiry();
      fetchNotes();
      fetchCommunications();
      loadDocuments();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchEnquiry = async () => {
    try {
      const data = await admissionService.getEnquiryById(id!);
      setEnquiry(data);
    } catch (error) {
      console.error("Error fetching enquiry:", error);
      toast.error("Failed to load enquiry details");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const data = await admissionService.getEnquiryNotes(id!);
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    }
  };

  const fetchCommunications = async () => {
    try {
      const data = await admissionService.getCommunicationHistory(id!);
      setCommunications(data);
    } catch (error) {
      console.error("Error fetching communications:", error);
      toast.error("Failed to load communication history");
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await admissionService.getAllDocuments(id!);
      setDocuments(data);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Failed to load documents");
    }
  };

  const handleSubmit = async (data: ProspectiveStudent) => {
    try {
      if (id) {
        await admissionService.updateEnquiry(id, data);
        toast.success("Enquiry updated successfully");
      } else {
        const result = await admissionService.createEnquiry(data);
        toast.success("Enquiry created successfully");
        navigate(`/admission-enquiry/${result.id}`);
      }
    } catch (error) {
      console.error("Error saving enquiry:", error);
      toast.error("Failed to save enquiry");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      await admissionService.addEnquiryNote(id!, newNote);
      setNewNote("");
      fetchNotes();
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleAddCommunication = async () => {
    if (!newMessage.trim()) return;
    try {
      await admissionService.addCommunication(id!, {
        type: communicationType,
        message: newMessage,
      });
      setNewMessage("");
      fetchCommunications();
      toast.success("Communication recorded successfully");
    } catch (error) {
      console.error("Error recording communication:", error);
      toast.error("Failed to record communication");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">
            {id ? "Edit Admission Enquiry" : "New Admission Enquiry"}
          </h1>
        </div>
        {enquiry && (
          <Badge variant={enquiry.status === "APPROVED" ? "success" : "secondary"}>
            {enquiry.status}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Enquiry Details</CardTitle>
          </CardHeader>
          <CardContent>
            <AdmissionEnquiryForm
              initialData={enquiry}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {id && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentUploadSection
                    prospectiveStudentId={id}
                    documents={documents}
                    onDocumentUpload={loadDocuments}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note..."
                      />
                      <Button
                        onClick={handleAddNote}
                        disabled={savingNote || !newNote.trim()}
                      >
                        {savingNote ? "Saving..." : "Add"}
                      </Button>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-4">
                        {notes.map((note) => (
                          <div key={note.id} className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">{note.content}</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {new Date(note.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Communication History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Select
                        value={communicationType}
                        onValueChange={(value) => setCommunicationType(value as typeof communicationType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="in_person">In Person</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex space-x-2">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Record communication..."
                        />
                        <Button
                          onClick={handleAddCommunication}
                          disabled={!newMessage.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-4">
                        {communications.map((comm) => (
                          <div key={comm.id} className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-2">
                              {comm.type === "email" && <Mail className="h-4 w-4" />}
                              {comm.type === "phone" && <Phone className="h-4 w-4" />}
                              {comm.type === "in_person" && <User className="h-4 w-4" />}
                              <span className="text-sm font-medium">
                                {comm.type.replace("_", " ").toUpperCase()}
                              </span>
                            </div>
                            <p className="mt-2 text-sm">{comm.message}</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {new Date(comm.communicationDate).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdmissionEnquiry;
