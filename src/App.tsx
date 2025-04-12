import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme-provider.tsx';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CustomCursor } from '@/components/ui/custom-cursor';
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
import { useAuth } from '@/lib/auth';
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
import PwaTest from './pages/PwaTest';
import WhatsAppTest from './pages/WhatsAppTest';
import IDCardForm from './pages/IDCardForm';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/', '/homework/view/:id', '/homework/:id', '/classwork/:id', '/admission-enquiry', '/admission-enquiry/:id', '/admission-enquiries', '/year-end-feedback', '/year-end-feedback/:id', '/pwa-test', '/whatsapp-test', '/id-card']

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
  if (!user && !PUBLIC_ROUTES.includes(location.pathname)) {
    // Store the attempted URL for redirect after login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If authenticated and trying to access auth pages (except ID card page)
  if (user && PUBLIC_ROUTES.includes(location.pathname) && location.pathname !== '/id-card') {
    return <Navigate to="/dashboard" replace />;
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
      <Route path='/admission-enquiries' element={<ViewAdmissionEnquiries />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pwa-test" element={<PwaTest />} />
      <Route path="/whatsapp-test" element={<WhatsAppTest />} />
      <Route path="/id-card" element={<IDCardForm />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/students"
        element={
          <PrivateRoute>
            <Layout>
              <Students />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/subjects"
        element={
          <PrivateRoute>
            <Layout>
              <Subjects />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/homework"
        element={
          <PrivateRoute>
            <Layout>
              <Homework />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/homework/view/:id" element={<HomeworkView />} />
      <Route path="/homework/:id" element={<HomeworkDetails />} />
      <Route
        path="/fees"
        element={
          <PrivateRoute>
            <Layout>
              <Fees />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/classwork"
        element={
          <PrivateRoute>
            <Layout>
              <ClassworkComponent />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/classwork/:id" element={<ClassworkDetail />} />

      <Route
        path="/attendance"
        element={
          <PrivateRoute>
            <Layout>
              <AttendancePage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <PrivateRoute>
            <Layout>
              <Feedback />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Layout>
              <NotificationsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/admission-enquiry" element={<AdmissionEnquiry />} />
      <Route path="/admission-enquiry/:id" element={<AdmissionEnquiry />} />
      <Route
        path="/admission-enquiries"
        element={
          <PrivateRoute>
            <Layout>
              <ViewAdmissionEnquiries />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/year-end-feedback" element={<YearEndFeedback />} />
      <Route path="/year-end-feedback/:id" element={<YearEndFeedback />} />
      <Route
        path="/view-year-end-feedback"
        element={
          <PrivateRoute>
            <Layout>
              <ViewYearEndFeedback />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/admission/process/:id" element={<AdmissionProcess />} />

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
{/* ID Card route removed from protected routes and added to public routes */}

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <TooltipProvider>
        <AuthProvider>
          <Router>
            <CustomCursor />
            <div className="flex flex-col min-h-screen bg-background mt-4">
              <AppRoutes />
              <Toaster position="top-right" />
            </div>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
