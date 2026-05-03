import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CustomCursor } from '@/components/ui/custom-cursor';
// AnimatedBackground removed - dark mode cleanup
import Layout from './components/Layout';
import Login from './pages/Login';
import { useAuth } from '@/lib/auth-provider';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Subjects = lazy(() => import('./pages/Subjects'));
const Homework = lazy(() => import('./pages/Homework'));
const Fees = lazy(() => import('./pages/Fees'));
const ClassworkComponent = lazy(() => import('./pages/Classwork'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const AttendancePage = lazy(() => import('./pages/Attendance'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const Home = lazy(() => import('./pages/Home/index'));
const Toaster = lazy(() => import('@/components/ui/toast').then(module => ({ default: module.Toaster })));
// Using unified ContentDetails component for both homework and classwork details
const ClassworkDetail = lazy(() => import('./pages/ClassworkDetail'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Register = lazy(() => import('./pages/Register'));
const HomeworkView = lazy(() => import('./pages/HomeworkView'));
const NotificationsPage = lazy(() => import('./pages/notifications'));
const ProfilePage = lazy(() => import('./pages/profile'));
const HomeworkDetails = lazy(() => import('./pages/HomeworkDetails'));
const ViewAdmissionEnquiries = lazy(() => import('./pages/ViewAdmissionEnquiries'));
const AdmissionEnquiry = lazy(() => import('./pages/AdmissionEnquiry.tsx'));
const YearEndFeedback = lazy(() => import('./pages/YearEndFeedback'));
const ViewYearEndFeedback = lazy(() => import('./pages/ViewYearEndFeedback'));
const AdmissionProcess = lazy(() => import('./pages/AdmissionProcess'));
const DrawingExerciseTestPage = lazy(() => import('./pages/DrawingExerciseTest'));
const PwaTest = lazy(() => import('./pages/PwaTest'));
const WhatsAppTest = lazy(() => import('./pages/WhatsAppTest'));
const IDCardDetails = lazy(() => import('./pages/IDCardDetails'));
const IDCardView = lazy(() => import('./pages/IDCardView'));
const IDCardForm = lazy(() => import('./pages/IDCardForm'));
const PublicIDCardLookup = lazy(() => import('./pages/PublicIDCardLookup'));
const TestInteractiveAssignment = lazy(() => import('./pages/TestInteractiveAssignment'));
const KonvaTestPage = lazy(() => import('./pages/KonvaTestPage'));
const InteractiveAssignmentForm = lazy(() => import('@/components/interactive/InteractiveAssignmentForm').then(module => ({ default: module.InteractiveAssignmentForm })));
const InteractiveAssignments = lazy(() => import('./pages/InteractiveAssignments').then(module => ({ default: module.InteractiveAssignments })));
const EditInteractiveAssignment = lazy(() => import('./pages/EditInteractiveAssignment'));
const ViewInteractiveAssignment = lazy(() => import('./pages/ViewInteractiveAssignment'));
const SimplifiedPlayAssignment = lazy(() => import('./pages/SimplifiedPlayAssignment'));
const ParentFeedbackPortal = lazy(() => import('./pages/ParentFeedbackPortal'));
const ParentFeedbackSearch = lazy(() => import('./pages/ParentFeedbackSearch'));
const ParentFeedbackForm = lazy(() => import('./pages/ParentFeedbackForm'));
const ParentFeedbackList = lazy(() => import('./pages/ParentFeedbackList'));
const ViewAllParentFeedback = lazy(() => import('./pages/ViewAllParentFeedback'));
const UpdateParentFeedback = lazy(() => import('./pages/UpdateParentFeedback'));
const AdminFeedbackPage = lazy(() => import('./pages/AdminFeedbackPage'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
// Using unified PublicContentShare component for both homework and classwork
const PublicHomeworkShare = lazy(() => import('./pages/PublicHomeworkShare'));
const PublicClassworkShare = lazy(() => import('./pages/PublicClassworkShare'));
// Birthday pages
const PublicBirthdayPage = lazy(() => import('./pages/PublicBirthdayPage'));
const BirthdaysPage = lazy(() => import('./pages/BirthdaysPage'));
// Date Sheet pages
const DateSheet = lazy(() => import('./pages/DateSheet'));
const FinalDateSheet = lazy(() => import('./pages/FinalDateSheet'));
const NurseryUT1Syllabus = lazy(() => import('./pages/NurseryUT1Syllabus'));
// Public Fee Structure page
const FeeStructure = lazy(() => import('./pages/FeeStructure'));
const FeeChartPrint = lazy(() => import('./pages/FeeChartPrint'));
const AnnualSportsWeek = lazy(() => import('./pages/AnnualSportsWeek'));
const SportsEnrollmentList = lazy(() => import('./pages/SportsEnrollmentList'));
const SportsEnrollmentGrouped = lazy(() => import('./pages/SportsEnrollmentGrouped'));
const SchoolFeedback = lazy(() => import('./pages/SchoolFeedback'));
const AdminSchoolFeedback = lazy(() => import('./pages/AdminSchoolFeedback'));
const AdmissionQueries = lazy(() => import('./pages/AdmissionQueries'));
const AdmissionTest = lazy(() => import('./pages/AdmissionTest'));
const AdmissionTestResults = lazy(() => import('./pages/AdmissionTestResults'));
const ParentSubmittedFeedbackList = lazy(() => import('./pages/ParentSubmittedFeedbackList'));
const ParentSubmittedFeedbackDetail = lazy(() => import('./pages/ParentSubmittedFeedbackDetail'));
const UnitTestMarksEntry = lazy(() => import('./pages/UnitTestMarksEntry'));
const UnitTestReport = lazy(() => import('./pages/UnitTestReport'));
const CopyRequest = lazy(() => import('./pages/CopyRequest'));
const NextDayPlanPage = lazy(() => import('./pages/NextDayPlan'));
const SyllabusPage = lazy(() => import('./pages/Syllabus'));
const SyllabusDetailPage = lazy(() => import('./pages/SyllabusDetail'));
const ClassWorkbookPage = lazy(() => import('./pages/ClassWorkbook'));
const TimetablePage = lazy(() => import('./pages/Timetable'));
const VoiceAssistant = lazy(() => import('./pages/VoiceAssistant'));
const MonthlyRemarksReport = lazy(() => import('./pages/MonthlyRemarksReport'));
const AdminMonthlyRemarks = lazy(() => import('./pages/AdminMonthlyRemarks'));

// Private route component
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated and trying to access a private route
  if (!user) {
    // Store the attempted URL for redirect after login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path='/admission-enquiry' element={<AdmissionEnquiry />} />
        <Route path='/admission-enquiry/:id' element={<AdmissionEnquiry />} />
        <Route path='/admission-test' element={<AdmissionTest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pwa-test" element={<PwaTest />} />
        <Route path="/whatsapp-test" element={<WhatsAppTest />} />
        <Route path="/id-card" element={<PrivateRoute><IDCardView /></PrivateRoute>} />
        <Route path="/id-card/new" element={<IDCardForm />} />
        <Route path="/id-card/lookup" element={<PublicIDCardLookup />} />
        <Route path="/voice-assistant" element={<VoiceAssistant />} />
        <Route path="/id-cards" element={<PrivateRoute><IDCardDetails /></PrivateRoute>} />
        <Route path="/test-interactive-assignment" element={<TestInteractiveAssignment />} />
        <Route path="/konva-test" element={<KonvaTestPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/assignments/play/:id" element={<SimplifiedPlayAssignment />} />
        <Route path="/interactive-assignments/play/:id" element={<SimplifiedPlayAssignment />} />
        <Route path="/drawing-test" element={<DrawingExerciseTestPage />} />
        <Route path="/homework/view/:id" element={<HomeworkView />} />
        <Route path="/homework/:id" element={<HomeworkDetails />} />
        <Route path="/classwork/:id" element={<ClassworkDetail />} />
        <Route path="/admission/process/:id" element={<AdmissionProcess />} />

        {/* Public Parent Feedback Routes */}
        <Route path="/parent-feedback-portal" element={<ParentFeedbackPortal />} />
        <Route path="/parent-feedback-search" element={<ParentFeedbackSearch />} />

        {/* Public Share Routes - No authentication required */}
        <Route path="/share/homework/:token" element={<PublicHomeworkShare />} />
        <Route path="/share/classwork/:token" element={<PublicClassworkShare />} />
        
        {/* Public Birthday Page - No authentication required */}
        <Route path="/birthday/:studentId" element={<PublicBirthdayPage />} />
        
        {/* Public Date Sheet - No authentication required */}
        <Route path="/date-sheet" element={<DateSheet />} />
        <Route path="/final-date-sheet" element={<FinalDateSheet />} />

        {/* Public Syllabus pages - No authentication required */}
        <Route path="/syllabus/nursery-ut1" element={<NurseryUT1Syllabus />} />
        
        {/* Public Fee Structure - No authentication required */}
        <Route path="/fee-structure" element={<FeeStructure />} />
        <Route path="/fee-chart" element={<FeeChartPrint />} />
        <Route path="/sports-week" element={<AnnualSportsWeek />} />
        <Route path="/sports-week/enrollments" element={<SportsEnrollmentList />} />
        <Route path="/sports-week/enrollments/grouped" element={<SportsEnrollmentGrouped />} />

        {/* Public School Feedback - No authentication required */}
        <Route path="/school-feedback" element={<SchoolFeedback />} />

        {/* Public Timetable - No authentication required */}
        <Route path="/timetable" element={<TimetablePage />} />

        {/* Public Monthly Remarks Report - parents view via shared link */}
        <Route path="/monthly-remarks" element={<MonthlyRemarksReport />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <Students />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/subjects" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <Subjects />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/homework" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <Homework />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/classwork" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <ClassworkComponent />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/student-dashboard" element={
          <PrivateRoute>
            <Layout>
              <StudentDashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/fees" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <Fees />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <AttendancePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/classwork/:id/edit" element={
          <PrivateRoute>
            <Layout>
              <ClassworkDetail />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/homework/:id/edit" element={
          <PrivateRoute>
            <Layout>
              <HomeworkDetails />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/feedback" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <Feedback />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <Layout>
              <NotificationsPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/idcarddetails" element={
          <PrivateRoute>
            <Layout>
              <IDCardDetails />
            </Layout>
          </PrivateRoute>
        } />
        <Route path='/admission-enquiries' element={
          <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
            <Layout>
              <ViewAdmissionEnquiries />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path='/admission-queries' element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <AdmissionQueries />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/view-year-end-feedback" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
            <Layout>
              <ViewYearEndFeedback />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/year-end-feedback" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <YearEndFeedback />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/year-end-feedback/:id" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <YearEndFeedback />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Protected Parent Feedback Routes */}
        <Route path="/parent-feedback-list" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
            <Layout>
              <ParentFeedbackList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/parent-feedback-form" element={
          <PrivateRoute>
            <Layout>
              <ParentFeedbackForm />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/parent-feedback-form/:id" element={
          <PrivateRoute>
            <Layout>
              <ParentFeedbackForm />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/view-all-parent-feedback" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
            <Layout>
              <ViewAllParentFeedback />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/update-parent-feedback/:id" element={
          <PrivateRoute>
            <Layout>
              <UpdateParentFeedback />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/admin-feedback" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
            <Layout>
              <AdminFeedbackPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/monthly-remarks" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN', 'TEACHER']}>
            <Layout>
              <AdminMonthlyRemarks />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin-school-feedback" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
            <Layout>
              <AdminSchoolFeedback />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admission Test Routes */}
        <Route path="/admission-test" element={<AdmissionTest />} />
        <Route path="/admission-test-results" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <AdmissionTestResults />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Unit Test Routes */}
        <Route path="/unit-test-marks" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <UnitTestMarksEntry />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/unit-test-report" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <UnitTestReport />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Parent Submitted Feedback Routes */}
        <Route path="/parent-submitted-feedback-list" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['ADMIN']}>
            <Layout>
              <ParentSubmittedFeedbackList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/parent-submitted-feedback/:id" element={
          <PrivateRoute>
            <Layout>
              <ParentSubmittedFeedbackDetail />
            </Layout>
          </PrivateRoute>
        } />

        {/* Copy Request Route */}
        <Route path="/copy-request" element={
          <ProtectedRoute requireAuth={true} allowedRoles={['TEACHER', 'ADMIN']}>
            <Layout>
              <CopyRequest />
            </Layout>
          </ProtectedRoute>
        } />

        {/* AI Planning Routes */}
        <Route path="/next-day-plan" element={
          <PrivateRoute>
            <Layout>
              <NextDayPlanPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/syllabus" element={
          <PrivateRoute>
            <Layout>
              <SyllabusPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/syllabus/:id" element={
          <PrivateRoute>
            <Layout>
              <SyllabusDetailPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/class-workbook" element={
          <PrivateRoute>
            <Layout>
              <ClassWorkbookPage />
            </Layout>
          </PrivateRoute>
        } />
        {/* Timetable moved to public routes */}

        {/* Birthday Routes */}
        <Route path="/birthdays" element={
          <PrivateRoute>
            <Layout>
              <BirthdaysPage />
            </Layout>
          </PrivateRoute>
        } />

        {/* Interactive Assignments Routes */}
        <Route
          path="/interactive-assignments"
          element={
            <ProtectedRoute
              requireAuth={true}
              allowedRoles={['TEACHER', 'ADMIN', 'STUDENT']}
            >
              <Layout>
                <InteractiveAssignments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interactive-assignments/create"
          element={
            <ProtectedRoute
              requireAuth={true}
              allowedRoles={['TEACHER', 'ADMIN']}
            >
              <Layout>
                <InteractiveAssignmentForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interactive-assignments/edit/:id"
          element={
            <ProtectedRoute
              requireAuth={true}
              allowedRoles={['TEACHER', 'ADMIN']}
            >
              <Layout>
                <EditInteractiveAssignment />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interactive-assignments/view/:id"
          element={
            <ProtectedRoute
              requireAuth={true}
              allowedRoles={['TEACHER', 'ADMIN', 'STUDENT']}
            >
              <Layout>
                <ViewInteractiveAssignment />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <TooltipProvider>
      {/* Router is now provided in main.tsx */}
      <CustomCursor />
      <div className="flex flex-col min-h-screen bg-background relative z-10">
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
          <AppRoutes />
          <Toaster />
          <PWAInstallBanner />
        </Suspense>
      </div>
    </TooltipProvider>
  );
}

export default App;








