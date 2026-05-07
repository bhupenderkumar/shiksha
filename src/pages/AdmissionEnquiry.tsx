import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { admissionService } from "@/services/admissionService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AdmissionEnquiryForm } from '@/components/admission/AdmissionEnquiryForm';
import { SEO } from "@/components/SEO";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Book,
  Users,
  AlertCircle,
  GraduationCap,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Youtube,
  ExternalLink,
  Send,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { toast } from "@/components/ui/toast";
import { useAuth } from '@/lib/auth-provider';
import Layout from '@/components/Layout';
import PublicLayout from '@/components/PublicLayout';
import { format } from 'date-fns';
import { ADMISSION_STATUS } from '@/lib/constants';
import { SCHOOL_INFO } from '@/constants/schoolInfo';
import type { ClassLevel } from '@/components/admission-tests/types';
import type {
  ProspectiveStudent,
  AdmissionProcess,
  AdmissionTimelineStep,
  RequiredDocument,
  ProspectiveStudentData
} from '@/types/admission';

/**
 * Maps a grade name (from the class/grade selector) to the admission test ClassLevel.
 * Grades that don't have a matching test default to 'class-1'.
 */
function gradeToTestLevel(grade: string): ClassLevel {
  const normalized = grade.toLowerCase().trim();
  if (normalized.includes('pre-nursery') || normalized.includes('pre nursery') || normalized.includes('prenursery') || normalized.includes('playgroup') || normalized.includes('play group')) {
    return 'pre-nursery';
  }
  if (normalized === 'nursery') {
    return 'nursery';
  }
  if (normalized === 'lkg' || normalized === 'ukg' || normalized === 'kg' || normalized.includes('kindergarten')) {
    return 'kg';
  }
  // For Grade 1 and above, use the class-1 math test
  return 'class-1';
}

/**
 * Builds a professionally crafted WhatsApp marketing message for admission follow-up.
 */
function buildWhatsAppMessage(student: ProspectiveStudent): string {
  const schoolName = SCHOOL_INFO.fullName || SCHOOL_INFO.name;
  const lines = [
    `🏫 *${schoolName}*`,
    `"${SCHOOL_INFO.tagline}"`,
    ``,
    `Dear *${student.parentName}*,`,
    ``,
    `Thank you for your interest in ${schoolName} for your child *${student.studentName}* (applying for *${student.gradeApplying}*). We are delighted to welcome you to our school family! 🎓`,
    ``,
    `✨ *Why Choose ${schoolName}?*`,
    `✅ 100% Guaranteed Quality Education for your child`,
    `✅ Experienced & Caring Teachers`,
    `✅ Safe, Nurturing & Fun Learning Environment`,
    `✅ Activity-based & Holistic Curriculum`,
    `✅ Smart Classrooms with Modern Facilities`,
    `✅ Regular Parent-Teacher Communication`,
    `✅ Sports, Art & Personality Development Programs`,
    ``,
    `🎯 *We Guarantee:*`,
    `Your child's education is our top priority. We provide personalised attention to every student and ensure 100% holistic development — academic, physical, and emotional growth.`,
    ``,
    `📍 *Visit Us:*`,
    `${SCHOOL_INFO.address}`,
    `${SCHOOL_INFO.googleMapsUrl}`,
    ``,
    `📞 *Contact:* ${SCHOOL_INFO.phone}`,
    `📧 *Email:* ${SCHOOL_INFO.email}`,
    `🌐 *Website:* ${SCHOOL_INFO.website}`,
    ``,
    `🔗 *Follow Us:*`,
    `📘 Facebook: ${SCHOOL_INFO.socialMedia?.facebook || ''}`,
    `📺 YouTube: ${SCHOOL_INFO.socialMedia?.youtube || ''}`,
    `📸 Instagram: ${SCHOOL_INFO.socialMedia?.instagram || ''}`,
    ``,
    `We look forward to having *${student.studentName}* as part of our school family! Schedule a school visit anytime — we'd love to show you around. 🤝`,
    ``,
    `Warm Regards,`,
    `*${SCHOOL_INFO.principalName}*`,
    `Principal, ${schoolName}`,
  ];
  return lines.join('\n');
}

/**
 * Opens WhatsApp with a pre-filled message to the parent's number.
 */
function openWhatsAppMessage(student: ProspectiveStudent) {
  const message = buildWhatsAppMessage(student);
  // Clean phone: remove spaces, dashes, brackets; keep digits and leading +
  let phone = student.contactNumber.replace(/[\s\-()]/g, '');
  // If starts with +, remove it
  if (phone.startsWith('+')) phone = phone.slice(1);
  // If doesn't start with country code, prepend 91 (India)
  if (!phone.startsWith('91') && phone.length === 10) phone = '91' + phone;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

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
        toast.success('Admission enquiry submitted! Redirecting to admission test...');
        // Navigate to the admission test page with the level pre-selected based on grade
        const testLevel = gradeToTestLevel(formData.gradeApplying);
        navigate(`/admission-test?level=${testLevel}&name=${encodeURIComponent(formData.studentName)}`);
        return;
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
    const Wrapper = user ? Layout : PublicLayout;
    return (
      <Wrapper>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Wrapper>
    );
  }

  if (error) {
    const Wrapper = user ? Layout : PublicLayout;
    return (
      <Wrapper>
        <div className="p-4 min-h-screen">
          <EmptyState
            icon={<AlertCircle className="w-12 h-12 text-red-500" />}
            title="Error Loading Enquiry"
            description={error}
            action={
              <Button
                variant="outline"
                onClick={() => navigate(user ? '/admission/enquiries' : '/')}
              >
                Go Back
              </Button>
            }
          />
        </div>
      </Wrapper>
    );
  }

  // For new admission - use PublicLayout if user is not logged in
  if (!id) {
    const Wrapper = user ? Layout : PublicLayout;
    return (
      <Wrapper>
        <SEO
          title="Admission Enquiry 2026-27 – Apply Online"
          description="Apply online for admission to First Step Pre School & Primary School in Saurabh Vihar, Badarpur, Delhi. Playgroup, Nursery, LKG, UKG, Class 1–5. Quick form, fast response. Call +91 96679 35518."
          path="/admission-enquiry"
        />
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-violet-100/60 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-fuchsia-100/60 blur-3xl" />
            </div>
            <div className="relative container mx-auto px-4 py-12">
              <Button
                variant="ghost"
                onClick={() => navigate(user ? '/admission/enquiries' : '/')}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              
              <div className="text-center max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-sm font-medium mb-6">
                  ✨ Start Your Journey
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Admission{" "}
                  <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Enquiry
                  </span>
                </h1>
                <p className="text-gray-500 text-lg">
                  Fill out the form below to begin your child's educational journey with us.
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="container mx-auto px-4 pb-12">
            <div className="max-w-3xl mx-auto">
              <AdmissionEnquiryForm onSubmit={handleSubmit} />
            </div>
          </div>
        </div>
      </Wrapper>
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

  const testLevel = gradeToTestLevel(student.gradeApplying);

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admission/enquiries')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Admission Enquiry</h1>
              <p className="text-sm text-muted-foreground">
                {student.studentName} — {student.gradeApplying}
              </p>
            </div>
          </div>
          <Badge
            className="text-sm px-3 py-1"
            variant={
              student.status === ADMISSION_STATUS.NEW ? 'default' :
              student.status === ADMISSION_STATUS.IN_PROGRESS ? 'secondary' :
              student.status === ADMISSION_STATUS.APPROVED ? 'success' : 'destructive'
            }
          >
            {student.status.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Start Admission Test */}
          <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => navigate(`/admission-test?level=${testLevel}&name=${encodeURIComponent(student.studentName)}&prospectiveStudentId=${student.id}`)}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-violet-100 text-violet-600 group-hover:bg-violet-200 transition-colors">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Start Admission Test</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {student.gradeApplying} level test — no documents required
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-violet-400 group-hover:text-violet-600" />
            </CardContent>
          </Card>

          {/* Send WhatsApp Message */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => openWhatsAppMessage(student)}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Send WhatsApp Message</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Send welcome message with school info to parent
                </p>
              </div>
              <Send className="w-4 h-4 text-green-400 group-hover:text-green-600" />
            </CardContent>
          </Card>

          {/* Call Parent */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => window.open(`tel:${student.contactNumber}`, '_self')}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                <Phone className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Call Parent</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {student.contactNumber}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-600" />
                Student Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Users className="w-4 h-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Student Name</p>
                    <p className="font-medium">{student.studentName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Users className="w-4 h-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Parent Name</p>
                    <p className="font-medium">{student.parentName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Book className="w-4 h-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Grade Applying</p>
                    <p className="font-medium">{student.gradeApplying}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Phone className="w-4 h-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Contact Number</p>
                    <p className="font-medium">{student.contactNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Mail className="w-4 h-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-sm">{student.email}</p>
                  </div>
                </div>
                {student.appliedDate && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Applied Date</p>
                      <p className="font-medium">{format(new Date(student.appliedDate), 'PPP')}</p>
                    </div>
                  </div>
                )}
                {student.lastUpdateDate && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <Clock className="w-4 h-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="font-medium">{format(new Date(student.lastUpdateDate), 'PPP')}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Communication */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-green-600" />
                Communication & Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* WhatsApp Message Preview */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">WhatsApp Welcome Message</h4>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border text-sm space-y-2 max-h-48 overflow-y-auto">
                  <p className="font-bold">🏫 {SCHOOL_INFO.fullName || SCHOOL_INFO.name}</p>
                  <p className="italic text-gray-600">"{SCHOOL_INFO.tagline}"</p>
                  <p>Dear <strong>{student.parentName}</strong>,</p>
                  <p>Thank you for your interest in our school for <strong>{student.studentName}</strong> (applying for <strong>{student.gradeApplying}</strong>).</p>
                  <div className="text-gray-500 text-xs">
                    <p>+ School highlights, guarantee, links to Facebook, YouTube, Maps & more...</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => openWhatsAppMessage(student)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send via WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() => {
                      navigator.clipboard.writeText(buildWhatsAppMessage(student));
                      toast.success('Message copied to clipboard!');
                    }}
                  >
                    Copy Message
                  </Button>
                </div>
              </div>

              {/* Admission Test Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-violet-600" />
                  <h4 className="font-semibold text-violet-800">Admission Test</h4>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      Start an interactive admission test for <strong>{student.studentName}</strong>.
                      The test is pre-configured for <strong>{student.gradeApplying}</strong> level.
                      No documents are required — the student can take the test right away.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-600">Age-appropriate questions</span>
                      <CheckCircle2 className="w-4 h-4 text-green-600 ml-2" />
                      <span className="text-xs text-gray-600">Instant results</span>
                    </div>
                  </div>
                  <Button
                    className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                    onClick={() => navigate(`/admission-test?level=${testLevel}&name=${encodeURIComponent(student.studentName)}&prospectiveStudentId=${student.id}`)}
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Start Test
                  </Button>
                </div>
              </div>

              {/* School Links for quick sharing */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">School Links</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SCHOOL_INFO.socialMedia?.facebook && (
                    <a
                      href={SCHOOL_INFO.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-white border hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
                    >
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {SCHOOL_INFO.socialMedia?.youtube && (
                    <a
                      href={SCHOOL_INFO.socialMedia.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-white border hover:bg-red-50 hover:border-red-300 transition-colors text-sm"
                    >
                      <Youtube className="w-4 h-4 text-red-600" />
                      <span>YouTube</span>
                    </a>
                  )}
                  {SCHOOL_INFO.googleMapsUrl && (
                    <a
                      href={SCHOOL_INFO.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-white border hover:bg-green-50 hover:border-green-300 transition-colors text-sm"
                    >
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>Location</span>
                    </a>
                  )}
                  {SCHOOL_INFO.website && (
                    <a
                      href={`https://${SCHOOL_INFO.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-white border hover:bg-violet-50 hover:border-violet-300 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4 text-violet-600" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Required Documents */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-orange-600" />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Admission Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeline.map((step, index) => (
                  <div
                    key={step.status}
                    className="flex items-center gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-100 text-green-600' :
                        step.current ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-300' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {step.completed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : step.current ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                        )}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className={`w-0.5 h-6 mt-1 ${
                          step.completed ? 'bg-green-300' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className={`text-sm font-medium ${
                        step.completed ? 'text-green-700' :
                        step.current ? 'text-blue-700' :
                        'text-gray-500'
                      }`}>
                        {step.title.replace(/_/g, ' ')}
                      </p>
                    </div>
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
