import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { admissionService } from "@/services/admissionService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AdmissionEnquiryForm } from '@/components/admission/AdmissionEnquiryForm';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Book,
  Users,
  AlertCircle,
} from 'lucide-react';
import { toast } from "@/components/ui/toast";
import { useAuth } from '@/lib/auth-provider';
import Layout from '@/components/Layout';
import { format } from 'date-fns';
import { ADMISSION_STATUS } from '@/lib/constants';
import type {
  ProspectiveStudent,
  AdmissionProcess,
  AdmissionTimelineStep,
  RequiredDocument,
  ProspectiveStudentData
} from '@/types/admission';

interface DocumentUploadProps {
  documentType: RequiredDocument;
  status: {
    url?: string;
    verificationStatus?: string;
  };
  onUpload: (file: File) => Promise<void>;
  onView: () => Promise<void>;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  status,
  onUpload,
  onView
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await onUpload(file);
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <Book className="h-6 w-6 text-gray-400" />
        <div>
          <h4 className="font-medium">{documentType.replace(/_/g, ' ').toUpperCase()}</h4>
          <p className="text-sm text-gray-500">
            {status.url ? 'Document uploaded' : 'No document uploaded'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status.url && (
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
          >
            View Document
          </Button>
        )}
        <div className="relative">
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            disabled={uploading}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdmissionEnquiry = () => {
  const { id } = useParams() as { id?: string };
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<ProspectiveStudent | null>(null);
  const [process, setProcess] = useState<AdmissionProcess | null>(null);
  const [timeline, setTimeline] = useState<AdmissionTimelineStep[]>([]);

  useEffect(() => {
    if (id) {
      const fetchEnquiryDetails = async () => {
        try {
          setLoading(true);
          const data = await admissionService.getEnquiryById(id);
          setStudent(data.student);
          setProcess(data.process);
          setTimeline(data.timeline);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch enquiry details');
          if (err instanceof Error && err.message.includes('Not found')) {
            toast.error('Admission enquiry not found');
            navigate('/admission/enquiries');
            return;
          }
        } finally {
          setLoading(false);
        }
      };

      fetchEnquiryDetails();
    }
  }, [id, navigate]);

  const handleSubmit = async (formData: ProspectiveStudentData) => {
    try {
      setLoading(true);
      if (id) {
        await admissionService.updateEnquiry(id, formData);
        toast.success('Admission enquiry updated successfully');
      } else {
        const result = await admissionService.createEnquiry(formData);
        toast.success('Admission enquiry created successfully');
        navigate(`/admission-enquiry/${result.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save admission enquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (documentType: RequiredDocument, file: File) => {
    if (!id) return;
    await admissionService.uploadDocument(id, file, documentType);
    const data = await admissionService.getEnquiryById(id);
    setProcess(data.process);
  };

  const handleDocumentView = async (documentPath: string) => {
    try {
      const url = await admissionService.getDocumentUrl(documentPath);
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to view document');
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4">
          <EmptyState
            icon={<AlertCircle className="w-12 h-12 text-red-500" />}
            title="Error Loading Enquiry"
            description={error}
            action={
              <Button
                variant="outline"
                onClick={() => navigate('/admission/enquiries')}
              >
                Go Back to Enquiries
              </Button>
            }
          />
        </div>
      </Layout>
    );
  }

  // For new admission
  if (!id) {
    return (
      <Layout>
        <div className="container mx-auto p-4 space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admission/enquiries')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">New Admission Enquiry</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <AdmissionEnquiryForm onSubmit={handleSubmit} />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // For viewing/editing existing admission
  if (!student || !process) {
    return (
      <Layout>
        <div className="p-4">
          <EmptyState
            icon={<AlertCircle className="w-12 h-12 text-yellow-500" />}
            title="No Data Found"
            description="Could not find the admission enquiry details"
            action={
              <Button
                variant="outline"
                onClick={() => navigate('/admission/enquiries')}
              >
                View All Enquiries
              </Button>
            }
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admission/enquiries')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Admission Enquiry Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Details */}
          <Card>
            <CardHeader>
              <CardTitle>Student Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <Badge
                  variant={
                    student.status === ADMISSION_STATUS.NEW ? 'default' :
                    student.status === ADMISSION_STATUS.IN_PROGRESS ? 'secondary' :
                    student.status === ADMISSION_STATUS.APPROVED ? 'success' : 'destructive'
                  }
                >
                  {student.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-gray-500">Student Name:</span>
                  <span className="ml-2 font-medium">{student.studentName}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-gray-500">Parent Name:</span>
                  <span className="ml-2">{student.parentName}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Book className="w-4 h-4 mr-2" />
                  <span className="text-gray-500">Grade Applying:</span>
                  <span className="ml-2">{student.gradeApplying}</span>
                </div>
                {student.appliedDate && (
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-gray-500">Applied Date:</span>
                    <span className="ml-2">{format(new Date(student.appliedDate), 'PPP')}</span>
                  </div>
                )}
                {student.lastUpdateDate && (
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="ml-2">{format(new Date(student.lastUpdateDate), 'PPP')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.documentsRequired && Object.entries(process.documentsRequired).map(([type, status]) => (
                <DocumentUpload
                  key={type}
                  documentType={type as RequiredDocument}
                  status={status}
                  onUpload={(file) => handleDocumentUpload(type as RequiredDocument, file)}
                  onView={() => status.url ? handleDocumentView(status.url) : undefined}
                />
              ))}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Admission Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {timeline.map((step, index) => (
                  <div
                    key={step.status}
                    className="flex flex-col items-center"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-100 text-green-600' :
                      step.current ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <div className="w-2 h-2 rounded-full bg-green-600" />
                      ) : step.current ? (
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                      )}
                    </div>
                    <div className="mt-2 text-sm font-medium text-center">
                      {step.title}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="absolute left-0 w-full h-0.5 bg-gray-200 -z-10" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdmissionEnquiry;
