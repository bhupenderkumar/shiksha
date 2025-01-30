import { useEffect, useState } from 'react';
import { useProfile } from '@/services/profileService';
import { feesService, Fee } from '@/services/feesService';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { studentService } from '@/services/student.service';
import { motion } from 'framer-motion';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, User, Calendar, Droplet, School, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { generateProfilePDF } from '@/services/pdfService';

const ProfilePage = () => {
  const { profile, loading, error } = useProfile();
  const [student, setStudent] = useState<any>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (profile && profile.role === 'STUDENT') {
      fetchStudentDetails();
    }
  }, [profile]);

  const fetchStudentDetails = async () => {
    try {
      setLoadingStudent(true);
      const data = await studentService.findByEmail(profile?.email || '');
      setStudent(data);
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleDownloadProfile = async () => {
    if (student && profile) {
      try {
        setDownloading(true);
        await generateProfilePDF(student, profile);
      } catch (error) {
        console.error('Error generating profile PDF:', error);
      } finally {
        setDownloading(false);
      }
    }
  };

  if (loading || loadingStudent) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-3/4 md:w-1/2" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading profile: {error.message}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No profile found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
        <Button
          onClick={handleDownloadProfile}
          disabled={downloading || !student}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          {downloading ? 'Downloading...' : 'Download Profile'}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{profile.full_name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">{profile.role.toLowerCase()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                Student Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Admission Number</p>
                  <p className="font-medium">{student?.admissionNumber}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Class & Section</p>
                  <p className="font-medium">{student?.class?.name} {student?.class?.section}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{student && student.dateOfBirth && format(new Date(student?.dateOfBirth), 'dd MMMM yyyy')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="font-medium">{student?.bloodGroup || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">{student && student.createdAt && format(new Date(student?.createdAt), 'dd MMMM yyyy')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{student && student.updatedAt && format(new Date(student?.updatedAt), 'dd MMMM yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      
    </div>
  );
};

export default ProfilePage;
