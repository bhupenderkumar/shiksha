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
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';

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
        element: <IDCardForm />,
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
        path: 'admission-enquiries',
        element: <ViewAdmissionEnquiries />,
      },
    ],
  },
]);
