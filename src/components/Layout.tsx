import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  ClipboardList,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['admin', 'teacher', 'student'] },
    { icon: Users, label: 'Students', path: '/students', roles: ['admin', 'teacher'] },
    { icon: GraduationCap, label: 'Teachers', path: '/teachers', roles: ['admin'] },
    { icon: BookOpen, label: 'Classes', path: '/classes', roles: ['admin', 'teacher'] },
    { icon: FileText, label: 'Homework', path: '/homework', roles: ['admin', 'teacher', 'student'] },
    { icon: ClipboardList, label: 'Assignments', path: '/assignments', roles: ['admin', 'teacher', 'student'] },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">School MS</h1>
        </div>
        <nav className="mt-4">
          {menuItems.map((item, index) => (
            item.roles.includes(profile?.role) && (
              <a
                key={index}
                href={item.path}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </a>
            )
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;