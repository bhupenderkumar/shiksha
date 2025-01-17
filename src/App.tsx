import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Home from './pages/Home';
import { Toaster } from 'react-hot-toast';
import ClassworkDetail from './pages/ClassworkDetail';
import Feedback from './pages/Feedback';
import Register from './pages/Register';
import HomeworkView from './pages/HomeworkView';
import NotificationsPage from './pages/notifications';
import ProfilePage from './pages/profile';
import HomeworkDetails from './pages/HomeworkDetails';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/', '/homework/view/:id', '/homework/:id', '/classwork/:id']

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

  // If authenticated and trying to access auth pages
  if (user && PUBLIC_ROUTES.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/homework/view/:id" element={
        <Layout>
          <HomeworkView />
        </Layout>
      } />
      <Route path="/homework/:id" element={<HomeworkDetails />} />
      <Route path="/classwork/:id" element={<ClassworkDetail />} />

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

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <div className="flex flex-col min-h-screen bg-background mt-4">
          <AppRoutes />
        </div>
      </Router>
    </>
  );
}

export default App;
