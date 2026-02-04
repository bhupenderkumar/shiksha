import { createBrowserRouter } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import AdmissionEnquiry from './pages/AdmissionEnquiry';
import AdmissionProgress from './pages/AdmissionProgress';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Homework from './pages/Homework';
import HomeworkDetails from './pages/HomeworkDetails';
import HomeworkEdit from './pages/HomeworkEdit';
import HomeworkView from './pages/HomeworkView';
import Classwork from './pages/Classwork';
import ClassworkDetail from './pages/ClassworkDetail';
import ClassworkEdit from './pages/ClassworkEdit';
import ClassworkView from './pages/ClassworkView';
import Students from './pages/Students';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Settings from './pages/Settings';
import ViewAdmissionEnquiries from './pages/ViewAdmissionEnquiries';
import IDCardForm from './pages/IDCardForm';
import IDCardDetails from './pages/IDCardDetails';
import IDCardView from './pages/IDCardView';
import IDCardTableView from './pages/IDCardTableView';
import { InteractiveAssignments } from './pages/InteractiveAssignments';
import InteractiveAssignmentForm from './pages/InteractiveAssignmentForm';
import ParentFeedbackForm from './pages/ParentFeedbackForm';
import ParentFeedbackList from './pages/ParentFeedbackList';
import ParentFeedbackSearch from './pages/ParentFeedbackSearch';
import ParentFeedbackSubmission from './pages/ParentFeedbackSubmission';
import ParentSubmittedFeedbackList from './pages/ParentSubmittedFeedbackList';
import ParentSubmittedFeedbackDetail from './pages/ParentSubmittedFeedbackDetail';
import ViewAllParentFeedback from './pages/ViewAllParentFeedback';
import UpdateParentFeedback from './pages/UpdateParentFeedback';
import PublicHomeworkShare from './pages/PublicHomeworkShare';
import PublicClassworkShare from './pages/PublicClassworkShare';
import PublicBirthdayPage from './pages/PublicBirthdayPage';
import BirthdaysPage from './pages/BirthdaysPage';
import DateSheet from './pages/DateSheet';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';

export const router = createBrowserRouter([
  // Public Birthday Page - Independent route (no layout wrapper)
  {
    path: '/birthday/:studentId',
    element: <PublicBirthdayPage />,
  },
  // Public Share Routes - Independent routes (no layout wrapper)
  {
    path: '/share/homework/:token',
    element: <PublicHomeworkShare />,
  },
  {
    path: '/share/classwork/:token',
    element: <PublicClassworkShare />,
  },
  // Birthdays listing page - Protected route with Layout
  {
    path: '/birthdays',
    element: (
      <ProtectedRoute>
        <Layout><BirthdaysPage /></Layout>
      </ProtectedRoute>
    ),
  },
  // Dashboard and other protected routes
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout><Dashboard /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/homework',
    element: (
      <ProtectedRoute>
        <Layout><Homework /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/homework/:id',
    element: (
      <ProtectedRoute>
        <Layout><HomeworkDetails /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/homework/edit/:id',
    element: (
      <ProtectedRoute>
        <Layout><HomeworkEdit /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/homework/view/:id',
    element: (
      <ProtectedRoute>
        <Layout><HomeworkView /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/classwork',
    element: (
      <ProtectedRoute>
        <Layout><Classwork /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/classwork/:id',
    element: (
      <ProtectedRoute>
        <Layout><ClassworkDetail /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/classwork/edit/:id',
    element: (
      <ProtectedRoute>
        <Layout><ClassworkEdit /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/classwork/view/:id',
    element: (
      <ProtectedRoute>
        <Layout><ClassworkView /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/students',
    element: (
      <ProtectedRoute>
        <Layout><Students /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/subjects',
    element: (
      <ProtectedRoute>
        <Layout><Subjects /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendance',
    element: (
      <ProtectedRoute>
        <Layout><Attendance /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/fees',
    element: (
      <ProtectedRoute>
        <Layout><Fees /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Layout><Settings /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/idcarddetails',
    element: (
      <ProtectedRoute>
        <Layout><IDCardDetails /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admission-enquiries',
    element: (
      <ProtectedRoute>
        <Layout><ViewAdmissionEnquiries /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/interactive-assignments',
    element: (
      <ProtectedRoute>
        <Layout><InteractiveAssignments /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/interactive-assignments/create',
    element: (
      <ProtectedRoute>
        <Layout><InteractiveAssignmentForm /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/interactive-assignments/edit/:id',
    element: (
      <ProtectedRoute>
        <Layout><InteractiveAssignmentForm /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/parent-feedback-list',
    element: (
      <ProtectedRoute>
        <Layout><ParentFeedbackList /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/parent-feedback-form',
    element: (
      <ProtectedRoute>
        <Layout><ParentFeedbackForm /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/parent-feedback-form/:id',
    element: (
      <ProtectedRoute>
        <Layout><ParentFeedbackForm /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/parent-submitted-feedback-list',
    element: (
      <ProtectedRoute>
        <Layout><ParentSubmittedFeedbackList /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/parent-submitted-feedback/:id',
    element: (
      <ProtectedRoute>
        <Layout><ParentSubmittedFeedbackDetail /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/view-all-parent-feedback',
    element: (
      <ProtectedRoute>
        <Layout><ViewAllParentFeedback /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/update-parent-feedback/:id',
    element: (
      <ProtectedRoute>
        <Layout><UpdateParentFeedback /></Layout>
      </ProtectedRoute>
    ),
  },
  // Public routes with PublicLayout
  {
    path: '/',
    element: <PublicLayout><Outlet /></PublicLayout>,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'admission-enquiry',
        element: <AdmissionEnquiry />,
      },
      {
        path: 'admission-progress/:id',
        element: <AdmissionProgress />,
      },
      {
        path: 'id-card',
        element: <IDCardView />,
      },
      {
        path: 'id-card/new',
        element: <IDCardForm />,
      },
      {
        path: 'id-cards-table',
        element: <IDCardTableView />,
      },
      {
        path: 'unauthorized',
        element: <Unauthorized />,
      },
      {
        path: 'parent-feedback-search',
        element: <ParentFeedbackSearch />,
      },
      {
        path: 'parent-feedback',
        element: <ParentFeedbackSearch />,
      },
      {
        path: 'parent-feedback-submission',
        element: <ParentFeedbackSubmission />,
      },
      {
        path: 'date-sheet',
        element: <DateSheet />,
      },
    ],
  },
]);
