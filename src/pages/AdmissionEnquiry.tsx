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
import { ProspectiveStudent, EnquiryStatus } from "@/types/admission";
import { ProcessTimeline } from "@/components/admission/ProcessTimeline";
import { FileUpload } from "@/components/ui/file-upload";
import { Separator } from "@/components/ui/separator";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

const REQUIRED_DOCUMENTS = [
  "STUDENT_ID",
  "STUDENT_PASSPORT",
  "STUDENT_BIRTH_CERTIFICATE",
  "STUDENT_IMMUNIZATION_RECORD",
  "STUDENT_MEDICAL_REPORT",
  "PARENT_ID",
  "PARENT_PASSPORT",
];

const FILE_CONFIG = {
  ALLOWED_TYPES: ["image/jpeg", "image/png", "application/pdf"],
};

export default function AdmissionEnquiry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState<ProspectiveStudent | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedDocType, setSelectedDocType] = useState<RequiredDocument | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [communicationType, setCommunicationType] = useState<'email' | 'phone' | 'in_person'>('email');

  useEffect(() => {
    if (id) {
      fetchEnquiry();
      fetchNotes();
      fetchCommunications();
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
      toast.error("Failed to load communications");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setSavingNote(true);
      await admissionService.addEnquiryNote(id!, newNote);
      setNewNote("");
      await fetchNotes();
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedDocType) {
      toast.error("Please select a document type");
      return;
    }

    try {
      setUploadingDoc(true);
      await admissionService.uploadDocument(id!, file, selectedDocType);
      toast.success("Document uploaded successfully");
      fetchEnquiry(); // Refresh document status
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploadingDoc(false);
      setSelectedDocType(null);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await admissionService.addCommunication(id!, {
        message: newMessage,
        type: communicationType,
        direction: 'outgoing'
      });
      setNewMessage("");
      await fetchCommunications();
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/admission-enquiries")}
          className="mb-4 sm:mb-0"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Enquiries
        </Button>
        <h1 className="text-3xl font-bold">
          {id ? "Resume Admission Process" : "New Admission Enquiry"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admission Form</CardTitle>
            </CardHeader>
            <CardContent>
              <AdmissionEnquiryForm
                initialData={enquiry}
                onSubmit={async (data) => {
                  try {
                    if (id) {
                      await admissionService.updateEnquiry(id, data);
                      toast.success("Enquiry updated successfully");
                    } else {
                      await admissionService.createEnquiry(data);
                      toast.success("Enquiry created successfully");
                      navigate("/admission-enquiries");
                    }
                  } catch (error) {
                    console.error("Error saving enquiry:", error);
                    toast.error("Failed to save enquiry");
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {enquiry && (
            <>
              {/* Quick Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Enquiry Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{enquiry.studentName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{enquiry.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{enquiry.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4" />
                    <span>Grade {enquiry.gradeApplying}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Process Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Admission Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProcessTimeline status={enquiry.status} />
                </CardContent>
              </Card>

              {/* Notes Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Notes & Updates</CardTitle>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Add New Note</SheetTitle>
                      </SheetHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Note Content</Label>
                          <Textarea
                            placeholder="Enter your note here..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={6}
                          />
                        </div>
                        <Button
                          onClick={handleAddNote}
                          disabled={savingNote || !newNote.trim()}
                          className="w-full"
                        >
                          {savingNote ? "Saving..." : "Save Note"}
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {notes.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No notes yet
                        </p>
                      ) : (
                        notes.map((note) => (
                          <Card key={note.id}>
                            <CardContent className="pt-4">
                              <p className="text-sm">{note.content}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(note.createdAt)}
                                <User className="h-3 w-3 ml-2" />
                                {note.createdBy}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Documents Tab */}
              <Tabs>
                <TabsList>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="communications">Communications</TabsTrigger>
                </TabsList>
                <TabsContent value="documents">
                  <Card>
                    <CardHeader>
                      <CardTitle>Required Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Select
                            value={selectedDocType || ""}
                            onValueChange={(value) => setSelectedDocType(value as RequiredDocument)}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                              {REQUIRED_DOCUMENTS.map(doc => (
                                <SelectItem key={doc} value={doc}>
                                  {doc.replace(/_/g, ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FileUpload
                            onUpload={handleFileUpload}
                            loading={uploadingDoc}
                            accept={FILE_CONFIG.ALLOWED_TYPES.join(',')}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          {enquiry?.AdmissionProcess?.documentsRequired.submitted.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{doc.type.replace(/_/g, ' ')}</p>
                                <p className="text-sm text-muted-foreground">
                                  Uploaded on {formatDate(new Date(doc.uploadDate))}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={doc.status === 'verified' ? 'success' : 'warning'}>
                                  {doc.status}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const url = await admissionService.getDocumentUrl(doc.fileName);
                                      window.open(url, '_blank');
                                    } catch (error) {
                                      toast.error("Failed to open document");
                                    }
                                  }}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Communications Tab */}
                <TabsContent value="communications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Communications History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-4">
                            {communications.map((comm) => (
                              <Card key={comm.id} className={`p-4 ${
                                comm.direction === 'outgoing' ? 'ml-12 bg-primary/10' : 'mr-12'
                              }`}>
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="whitespace-pre-wrap">{comm.message}</p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                      <Badge variant="outline">{comm.type}</Badge>
                                      {formatDate(comm.communicationDate)}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>

                        <Separator />

                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Select
                              value={communicationType}
                              onValueChange={(value) => setCommunicationType(value as any)}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="in_person">In Person</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Textarea
                              placeholder="Type your message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              className="flex-1"
                              rows={3}
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim()}
                              className="self-end"
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
