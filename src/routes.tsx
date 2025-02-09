import { createBrowserRouter } from 'react-router-dom';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import SlipManagement from '@/pages/SlipManagement';
import ViewAdmissionEnquiries from '@/pages/ViewAdmissionEnquiries';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/slip-management',
    element: <SlipManagement />,
  },
  {
    path: '/view-admission-enquiries',
    element: <ViewAdmissionEnquiries />,
  },
]);
