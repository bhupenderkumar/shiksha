import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  Calendar,
} from "lucide-react";
import { admissionService } from "@/services/admissionService";
import { classService } from "@/services/classService";
import { 
  ProspectiveStudent, 
  EnquiryStatus, 
  RequiredDocument, 
  DocumentStatus,
  AdmissionTimelineStep
} from "@/types/admission";
import { ProcessTimeline } from "@/components/admission/ProcessTimeline";
import { DocumentUpload } from "@/components/admission/DocumentUpload";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { REQUIRED_DOCUMENTS, ADMISSION_STATUS } from "@/lib/constants";

interface Class {
  id: string;
  name: string;
  section: string;
}

interface DocumentUploadStatus {
  uploaded: boolean;
  verified: boolean;
  url?: string;
  remarks?: string;
}

interface ProcessState {
  student: ProspectiveStudent | null;
  admissionProgress: {
    currentStatus: EnquiryStatus;
    documents: Record<RequiredDocument, DocumentStatus>;
    interviewDate?: Date;
    assignedClass?: string;
  } | null;
  timeline: AdmissionTimelineStep[];
}

const generateTimeline = (currentStatus: EnquiryStatus): AdmissionTimelineStep[] => {
  const statusOrder = Object.values(ADMISSION_STATUS);
  const currentIndex = statusOrder.indexOf(currentStatus);

  return [
    {
      step: 1,
      status: ADMISSION_STATUS.NEW,
      title: "Document Submission",
      description: "Submit required documents",
      completed: currentIndex > 0,
      current: currentIndex === 0,
      label: "Step 1"
    },
    {
      step: 2,
      status: ADMISSION_STATUS.IN_REVIEW,
      title: "Document Review",
      description: "Documents under review",
      completed: currentIndex > 1,
      current: currentIndex === 1,
      label: "Step 2"
    },
    {
      step: 3,
      status: ADMISSION_STATUS.SCHEDULED_INTERVIEW,
      title: "Interview",
      description: "Schedule and complete interview",
      completed: currentIndex > 2,
      current: currentIndex === 2,
      label: "Step 3"
    },
    {
      step: 4,
      status: ADMISSION_STATUS.PENDING_DOCUMENTS,
      title: "Final Verification",
      description: "Final document verification",
      completed: currentIndex > 3,
      current: currentIndex === 3,
      label: "Step 4"
    }
  ];
};

const AdmissionProcess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<ProcessState>({
    student: null,
    admissionProgress: null,
    timeline: []
  });
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [interviewDate, setInterviewDate] = useState<string>("");
  const [interviewNotes, setInterviewNotes] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadAdmissionData();
    loadAvailableClasses();
  }, [id]);

  const loadAdmissionData = async () => {
    if (!id) return;
    try {
      const [studentData, progressData, documents] = await Promise.all([
        admissionService.getEnquiryById(id),
        admissionService.getAdmissionProgress(id),
        admissionService.getAllDocuments(id)
      ]);

      setState({
        student: studentData,
        admissionProgress: {
          currentStatus: studentData.status,
          documents,
          interviewDate: progressData.interviewDate,
          assignedClass: progressData.assignedClass
        },
        timeline: generateTimeline(studentData.status)
      });
      
      if (progressData.interviewDate) {
        setInterviewDate(progressData.interviewDate.toISOString().split('T')[0]);
      }
    } catch (error) {
      toast.error("Failed to load admission data");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableClasses = async () => {
    try {
      const classes = await classService.findMany();
      setAvailableClasses(classes);
    } catch (error) {
      toast.error("Failed to load available classes");
    }
  };

  const handleDocumentUpload = async (file: File, documentType: RequiredDocument) => {
    if (!id) return;
    try {
      await admissionService.uploadDocument(id, file, documentType);
      toast.success("Document uploaded successfully");
      
      // Refresh document data and URLs
      const [newData, newDocuments] = await Promise.all([
        admissionService.getAdmissionProgress(id),
        admissionService.getAllDocuments(id)
      ]);
      
      setState(prev => ({
        ...prev,
        admissionProgress: {
          ...prev.admissionProgress!,
          documents: newDocuments
        }
      }));

      // Get the new document URL
      const docStatus = newDocuments[documentType];
      if (docStatus?.submitted?.[0]?.fileName) {
        const url = await admissionService.getDocumentUrl(docStatus.submitted[0].fileName);
        setDocumentUrls(prev => ({
          ...prev,
          [documentType]: url
        }));
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error instanceof Error ? error.message : "Failed to upload document");
    }
  };

  const handleDocumentVerification = async (
    documentType: RequiredDocument,
    status: "verified" | "rejected",
    remarks?: string
  ) => {
    if (!id) return;
    try {
      await admissionService.verifyDocument(id, documentType, status, remarks);
      toast.success("Document verification updated");
      loadAdmissionData();
    } catch (error) {
      toast.error("Failed to update document verification");
    }
  };

  const handleInterviewSchedule = async () => {
    if (!id || !interviewDate) {
      toast.error("Please select an interview date");
      return;
    }

    try {
      await admissionService.updateAdmissionProgress(id, {
        status: "SCHEDULED_INTERVIEW",
        interviewDate: new Date(interviewDate),
        notes: interviewNotes
      });
      toast.success("Interview scheduled successfully");
      loadAdmissionData();
    } catch (error) {
      toast.error("Failed to schedule interview");
    }
  };

  const handleStatusUpdate = async (newStatus: EnquiryStatus) => {
    if (!id) return;
    try {
      await admissionService.updateEnquiryStatus(id, newStatus);
      toast.success("Status updated successfully");
      loadAdmissionData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleClassAssignment = async () => {
    if (!id || !selectedClass) {
      toast.error("Please select a class");
      return;
    }

    try {
      await admissionService.updateAdmissionProgress(id, {
        assignedClass: selectedClass,
        notes: `Assigned to class ${selectedClass}`
      });
      toast.success("Class assigned successfully");
      loadAdmissionData();
    } catch (error) {
      toast.error("Failed to assign class");
    }
  };

  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDocumentUrls = async () => {
      const urls: Record<string, string> = {};
      for (const docType of REQUIRED_DOCUMENTS) {
        const docStatus = state.admissionProgress?.documents[docType];
        if (docStatus?.submitted?.length) {
          try {
            urls[docType] = await admissionService.getDocumentUrl(docStatus.submitted[0].fileName);
          } catch (error) {
            console.error(`Error getting URL for ${docType}:`, error);
          }
        }
      }
      setDocumentUrls(urls);
    };

    if (state.admissionProgress?.documents) {
      fetchDocumentUrls();
    }
  }, [state.admissionProgress?.documents]);

  const getDocumentUploadStatus = (docType: RequiredDocument): DocumentUploadStatus => {
    const docStatus = state.admissionProgress?.documents[docType];
    if (!docStatus?.submitted?.length) {
      return { uploaded: false, verified: false };
    }

    return {
      uploaded: true,
      verified: docStatus.verificationStatus?.[docType] === 'verified',
      url: documentUrls[docType],
      remarks: docStatus.rejectionReason?.[docType]
    };
  };

  const getDocumentStatusDisplay = (docType: RequiredDocument): string => {
    const docStatus = state.admissionProgress?.documents[docType];
    if (!docStatus?.submitted?.length) return 'Not Uploaded';
    const status = docStatus.verificationStatus?.[docType];
    if (!status) return 'Pending Verification';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!state.student || !state.admissionProgress) {
    return <div>Student not found</div>;
  }

  const currentTimelineStep = state.timeline.find(step => step.current);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto py-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-6">
          {/* Student Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Student Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p>{state.student.studentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Parent Name</p>
                <p>{state.student.parentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Grade Applying</p>
                <p>{state.student.gradeApplying}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant="outline">{state.student.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Main Process Card */}
          <Card>
            <CardHeader>
              <CardTitle>Admission Process</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={new URLSearchParams(window.location.search).get('tab') || "documents"} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="interview">Interview</TabsTrigger>
                  <TabsTrigger value="class">Class Assignment</TabsTrigger>
                </TabsList>

                <TabsContent value="documents">
                  <div className="space-y-4">
                    {REQUIRED_DOCUMENTS.map((docType) => (
                      <div key={docType} className="border p-4 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">{docType.replace('_', ' ')}</h4>
                          <Badge>{getDocumentStatusDisplay(docType)}</Badge>
                        </div>
                        <DocumentUpload
                          onUpload={(file) => handleDocumentUpload(file, docType)}
                          onVerify={(status, remarks) => handleDocumentVerification(docType, status, remarks)}
                          status={getDocumentUploadStatus(docType)}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="interview">
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Interview Date</label>
                        <input
                          type="date"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          className="w-full p-2 border rounded-md"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Interview Notes</label>
                        <textarea
                          value={interviewNotes}
                          onChange={(e) => setInterviewNotes(e.target.value)}
                          className="w-full p-2 border rounded-md"
                          rows={4}
                          placeholder="Add interview notes here..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={handleInterviewSchedule}
                        className="flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule Interview
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="class">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Select Class</label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableClasses.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} - {cls.section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleClassAssignment}>
                        Assign Class
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admission Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ProcessTimeline
                status={state.student.status}
                currentStep={currentTimelineStep?.step || 1}
                completedSteps={state.timeline
                  .filter(step => step.completed)
                  .map(step => step.title)
                }
                enquiryId={id}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default AdmissionProcess;
