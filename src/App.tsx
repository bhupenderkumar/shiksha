import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CustomCursor } from '@/components/ui/custom-cursor';
import { AnimatedBackground } from '@/components/ui/animated-background';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Subjects from './pages/Subjects';
import Homework from './pages/Homework';
import Fees from './pages/Fees';
import ClassworkComponent from './pages/Classwork';
import StudentDashboard from './pages/StudentDashboard';
import AttendancePage from './pages/Attendance';
import { useAuth } from '@/lib/auth-provider';
import SettingsPage from './pages/Settings';
import Home from './pages/Home/index';
import { Toaster } from 'react-hot-toast';
import ClassworkDetail from './pages/ClassworkDetail';
import Feedback from './pages/Feedback';
import Register from './pages/Register';
import HomeworkView from './pages/HomeworkView';
import NotificationsPage from './pages/notifications';
import ProfilePage from './pages/profile';
import HomeworkDetails from './pages/HomeworkDetails';
import ViewAdmissionEnquiries from './pages/ViewAdmissionEnquiries';
import AdmissionEnquiry from './pages/AdmissionEnquiry.tsx';
import YearEndFeedback from './pages/YearEndFeedback';
import ViewYearEndFeedback from './pages/ViewYearEndFeedback';
import AdmissionProcess from './pages/AdmissionProcess';
import DrawingExerciseTestPage from './pages/DrawingExerciseTest';
import PwaTest from './pages/PwaTest';
import WhatsAppTest from './pages/WhatsAppTest';

import IDCardDetails from './pages/IDCardDetails';
import IDCardView from './pages/IDCardView';
import TestInteractiveAssignment from './pages/TestInteractiveAssignment';
import KonvaTestPage from './pages/KonvaTestPage';
import { InteractiveAssignmentForm } from '@/components/interactive/InteractiveAssignmentForm';
import { InteractiveAssignments } from './pages/InteractiveAssignments';
import EditInteractiveAssignment from './pages/EditInteractiveAssignment';
import ViewInteractiveAssignment from './pages/ViewInteractiveAssignment';
// PlayAssignment removed as it's not used
import SimplifiedPlayAssignment from './pages/SimplifiedPlayAssignment';
import ParentFeedbackPortal from './pages/ParentFeedbackPortal';
import ParentFeedbackSearch from './pages/ParentFeedbackSearch';
import ParentFeedbackForm from './pages/ParentFeedbackForm';
import ParentFeedbackList from './pages/ParentFeedbackList';
import ViewAllParentFeedback from './pages/ViewAllParentFeedback';
import UpdateParentFeedback from './pages/UpdateParentFeedback';
import AdminFeedbackPage from './pages/AdminFeedbackPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';

// PUBLIC_ROUTES removed as it's not used

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
      <Route path="/test-interactive-assignment" element={<TestInteractiveAssignment />} />
      <Route path="/konva-test" element={<KonvaTestPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/assignments/play/:id" element={<SimplifiedPlayAssignment />} />
      <Route path="/interactive-assignments/play/:id" element={<SimplifiedPlayAssignment />} />
      <Route path="/drawing-test" element={<DrawingExerciseTestPage />} />
      <Route path="/year-end-feedback" element={<YearEndFeedback />} />
      <Route path="/year-end-feedback/:id" element={<YearEndFeedback />} />
      <Route path="/homework/view/:id" element={<HomeworkView />} />
      <Route path="/homework/:id" element={<HomeworkDetails />} />
      <Route path="/classwork/:id" element={<ClassworkDetail />} />
      <Route path="/admission/process/:id" element={<AdmissionProcess />} />

      {/* Public Parent Feedback Routes */}
      <Route path="/parent-feedback-portal" element={<ParentFeedbackPortal />} />
      <Route path="/parent-feedback-search" element={<ParentFeedbackSearch />} />

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
  );
}

function App() {
  return (
    <TooltipProvider>
      {/* Router is now provided in main.tsx */}
      <CustomCursor />
      <AnimatedBackground particleCount={30} />
      <div className="flex flex-col min-h-screen bg-transparent mt-4 relative z-10">
        <AppRoutes />
        <Toaster position="top-right" />
      </div>
    </TooltipProvider>
  );
}

export default App;








