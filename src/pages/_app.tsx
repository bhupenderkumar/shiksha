import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Homework from '../pages/Homework';
import Fees from '../pages/Fees';
import Subjects from '../pages/Subjects';
import { useAuth } from '../lib/auth';
import '../styles/globals.css';
import { Students } from '.';

function App() {
  const { profile } = useAuth();

  return (
    <Router>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-[#4f46e5] to-[#9333ea]">
          <Routes>
            <Route path="/dashboard" Component={Dashboard} />
            <Route path="/students" Component={Students} />
            <Route path="/subjects" Component={Subjects} />
            <Route path="/homework" Component={Homework} />
            <Route path="/fees" Component={Fees} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Layout>
    </Router>
  );
}


export default App;
