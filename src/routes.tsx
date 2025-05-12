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
import InteractiveAssignments from './pages/InteractiveAssignments';
import InteractiveAssignmentForm from './pages/InteractiveAssignmentForm';
import InteractiveAssignmentDetails from './pages/InteractiveAssignmentDetails';
import InteractiveAssignmentView from './pages/InteractiveAssignmentView';
import ParentFeedbackForm from './pages/ParentFeedbackForm';
import ParentFeedbackList from './pages/ParentFeedbackList';
import ParentFeedbackSearch from './pages/ParentFeedbackSearch';
import ParentFeedbackSubmission from './pages/ParentFeedbackSubmission';
import ParentSubmittedFeedbackList from './pages/ParentSubmittedFeedbackList';
import ParentSubmittedFeedbackDetail from './pages/ParentSubmittedFeedbackDetail';
import ViewAllParentFeedback from './pages/ViewAllParentFeedback';
import UpdateParentFeedback from './pages/UpdateParentFeedback';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';

export const router = createBrowserRouter([
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
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout><Outlet /></Layout>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'homework',
        element: <Homework />,
      },
      {
        path: 'homework/:id',
        element: <HomeworkDetails />,
      },
      {
        path: 'homework/edit/:id',
        element: <HomeworkEdit />,
      },
      {
        path: 'homework/view/:id',
        element: <HomeworkView />,
      },
      {
        path: 'classwork',
        element: <Classwork />,
      },
      {
        path: 'classwork/:id',
        element: <ClassworkDetail />,
      },
      {
        path: 'classwork/edit/:id',
        element: <ClassworkEdit />,
      },
      {
        path: 'classwork/view/:id',
        element: <ClassworkView />,
      },
      {
        path: 'students',
        element: <Students />,
      },
      {
        path: 'subjects',
        element: <Subjects />,
      },
      {
        path: 'attendance',
        element: <Attendance />,
      },
      {
        path: 'fees',
        element: <Fees />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'idcarddetails',
        element: <IDCardDetails />,
      },
      {
        path: 'admission-enquiries',
        element: <ViewAdmissionEnquiries />,
      },
      {
        path: 'interactive-assignments',
        element: <InteractiveAssignments />,
      },
      {
        path: 'interactive-assignments/create',
        element: <InteractiveAssignmentForm />,
      },
      {
        path: 'interactive-assignments/:id',
        element: <InteractiveAssignmentDetails />,
      },
      {
        path: 'interactive-assignments/edit/:id',
        element: <InteractiveAssignmentForm />,
      },
      {
        path: 'interactive-assignments/view/:id',
        element: <InteractiveAssignmentView />,
      },
      {
        path: 'parent-feedback-list',
        element: <ParentFeedbackList />,
      },
      {
        path: 'parent-feedback-form',
        element: <ParentFeedbackForm />,
      },
      {
        path: 'parent-feedback-form/:id',
        element: <ParentFeedbackForm />,
      },
      {
        path: 'parent-submitted-feedback-list',
        element: <ParentSubmittedFeedbackList />,
      },
      {
        path: 'parent-submitted-feedback/:id',
        element: <ParentSubmittedFeedbackDetail />,
      },
      {
        path: 'view-all-parent-feedback',
        element: <ViewAllParentFeedback />,
      },
      {
        path: 'update-parent-feedback/:id',
        element: <UpdateParentFeedback />,
      },
    ],
  },
]);
