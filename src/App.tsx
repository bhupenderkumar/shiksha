import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CustomCursor } from '@/components/ui/custom-cursor';
import { AnimatedBackground } from '@/components/ui/animated-background';
import Layout from './components/Layout';
import Login from './pages/Login';
import { useAuth } from '@/lib/auth-provider';
import { ProtectedRoute } from '@/components/ProtectedRoute';

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
// Date Sheet page
const DateSheet = lazy(() => import('./pages/DateSheet'));
// Public Fee Structure page
const FeeStructure = lazy(() => import('./pages/FeeStructure'));

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pwa-test" element={<PwaTest />} />
        <Route path="/whatsapp-test" element={<WhatsAppTest />} />
        <Route path="/id-card" element={<IDCardView />} />
        <Route path="/id-card/new" element={<IDCardForm />} />
        <Route path="/id-cards" element={<IDCardDetails />} />
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
        
        {/* Public Fee Structure - No authentication required */}
        <Route path="/fee-structure" element={<FeeStructure />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/students" element={
          <PrivateRoute>
            <Layout>
              <Students />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/subjects" element={
          <PrivateRoute>
            <Layout>
              <Subjects />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/homework" element={
          <PrivateRoute>
            <Layout>
              <Homework />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/classwork" element={
          <PrivateRoute>
            <Layout>
              <ClassworkComponent />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/student-dashboard" element={
          <PrivateRoute>
            <Layout>
              <StudentDashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/fees" element={
          <PrivateRoute>
            <Layout>
              <Fees />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/attendance" element={
          <PrivateRoute>
            <Layout>
              <AttendancePage />
            </Layout>
          </PrivateRoute>
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
          <PrivateRoute>
            <Layout>
              <Feedback />
            </Layout>
          </PrivateRoute>
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
          <PrivateRoute>
            <Layout>
              <ViewAdmissionEnquiries />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/view-year-end-feedback" element={
          <PrivateRoute>
            <Layout>
              <ViewYearEndFeedback />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/year-end-feedback" element={
          <PrivateRoute>
            <Layout>
              <YearEndFeedback />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/year-end-feedback/:id" element={
          <PrivateRoute>
            <Layout>
              <YearEndFeedback />
            </Layout>
          </PrivateRoute>
        } />

        {/* Protected Parent Feedback Routes */}
        <Route path="/parent-feedback-list" element={
          <PrivateRoute>
            <Layout>
              <ParentFeedbackList />
            </Layout>
          </PrivateRoute>
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
          <PrivateRoute>
            <Layout>
              <ViewAllParentFeedback />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/update-parent-feedback/:id" element={
          <PrivateRoute>
            <Layout>
              <UpdateParentFeedback />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/admin-feedback" element={
          <PrivateRoute>
            <Layout>
              <AdminFeedbackPage />
            </Layout>
          </PrivateRoute>
        } />

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
      <AnimatedBackground particleCount={30} />
      <div className="flex flex-col min-h-screen bg-transparent mt-4 relative z-10">
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
          <AppRoutes />
          <Toaster />
        </Suspense>
      </div>
    </TooltipProvider>
  );
}

export default App;








