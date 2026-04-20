import { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Menu,
  Home,
  BookOpen,
  Users,
  Calendar,
  Settings,
  CreditCard,
  Bell,
  ChevronRight,
  LogOut,
  MessageSquare,
  CreditCard as IdCard,
  Puzzle,
  MessageCircle,
  FileText,
  ListChecks,
  GraduationCap,
  LayoutDashboard,
  ClipboardList,
  Star,
  Cake,
  Mic,
  Brain,
  BookMarked,
  Clock,
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/lib/auth-provider';
import { ROUTES } from '@/constants/app-constants';
import { AnimatedText } from './ui/animated-text';
import { useProfileAccess } from '@/services/profileService';

import { NoInternet } from './NoInternet';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { InstallPWAButton } from "./ui/install-pwa-button";
import { BottomNav } from './layout/BottomNav';
import { useNotificationListener } from '@/hooks/use-notifications';
import { NotificationPermissionBanner } from './pwa/NotificationPermission';
import { notificationService } from '@/services/notificationService';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const navigate = useNavigate();

  // Listen for realtime notifications and show browser notifications
  useNotificationListener();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationService.getUnreadCount().then(setUnreadCount);
  }, [location.pathname]);
  const { user, signOut } = useAuth();
  const { profile } = useProfileAccess();

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    // Main
    { id: 1, icon: Home, label: 'Dashboard', path: ROUTES.DASHBOARD },
    { id: 20, icon: LayoutDashboard, label: 'Student Dashboard', path: '/student-dashboard', role: 'student' },
    { id: 9, icon: Bell, label: 'Notifications', path: ROUTES.NOTIFICATIONS },

    // Academics
    { id: 'section-academics', label: 'Academics', isSection: true },
    { id: 2, icon: Users, label: 'Students', path: ROUTES.STUDENTS, role: 'teacher' },
    { id: 21, icon: GraduationCap, label: 'Subjects', path: '/subjects', role: 'teacher' },
    { id: 3, icon: BookOpen, label: 'Homework', path: ROUTES.HOMEWORK },
    { id: 4, icon: BookOpen, label: 'Classwork', path: ROUTES.CLASSWORK },
    { id: 32, icon: BookOpen, label: 'Class Workbook', path: ROUTES.CLASS_WORKBOOK },
    { id: 13, icon: Puzzle, label: 'Interactive Tasks', path: ROUTES.INTERACTIVE_ASSIGNMENTS },
    { id: 5, icon: Calendar, label: 'Attendance', path: ROUTES.ATTENDANCE },
    { id: 33, icon: Clock, label: 'Timetable', path: ROUTES.TIMETABLE },
    { id: 37, icon: FileText, label: 'Date Sheet', path: '/date-sheet' },

    // Teaching Tools
    { id: 'section-teaching', label: 'Teaching Tools', isSection: true, role: 'teacher' },
    { id: 30, icon: Brain, label: 'AI Planner', path: ROUTES.NEXT_DAY_PLAN, role: 'teacher' },
    { id: 31, icon: BookMarked, label: 'Syllabus', path: ROUTES.SYLLABUS, role: 'teacher' },
    { id: 38, icon: FileText, label: 'Copy Request', path: ROUTES.COPY_REQUEST, role: 'teacher' },

    // Admissions
    { id: 'section-admissions', label: 'Admissions', isSection: true, role: 'teacher' },
    { id: 29, icon: ClipboardList, label: 'New Enquiry', path: ROUTES.ADMISSION_ENQUIRY, role: 'teacher' },
    { id: 34, icon: ClipboardList, label: 'All Queries', path: ROUTES.ADMISSION_QUERIES, role: 'teacher' },
    { id: 35, icon: GraduationCap, label: 'Admission Test', path: ROUTES.ADMISSION_TEST, role: 'teacher' },
    { id: 36, icon: GraduationCap, label: 'Test Results', path: ROUTES.ADMISSION_TEST_RESULTS, role: 'teacher' },
    { id: 24, icon: ClipboardList, label: 'All Enquiries', path: ROUTES.ADMISSION_ENQUIRIES, role: 'admin' },

    // Finance
    { id: 'section-finance', label: 'Finance', isSection: true, role: 'teacher' },
    { id: 6, icon: CreditCard, label: 'Fees', path: ROUTES.FEES, role: 'teacher' },

    // Assessment
    { id: 'section-assessment', label: 'Assessment', isSection: true, role: 'teacher' },
    { id: 26, icon: FileText, label: 'Marks Entry', path: ROUTES.UNIT_TEST_MARKS, role: 'teacher' },
    { id: 27, icon: ClipboardList, label: 'Test Report', path: ROUTES.UNIT_TEST_REPORT, role: 'teacher' },

    // Feedback
    { id: 'section-feedback', label: 'Feedback', isSection: true, role: 'teacher' },
    { id: 7, icon: MessageSquare, label: 'Teacher Feedback', path: ROUTES.FEEDBACK, role: 'teacher' },
    { id: 22, icon: Star, label: 'Year End Feedback', path: '/year-end-feedback', role: 'teacher' },
    { id: 23, icon: Star, label: 'View Year End Feedback', path: '/view-year-end-feedback', role: 'admin' },
    { id: 14, icon: FileText, label: 'Create Parent Feedback', path: ROUTES.PARENT_FEEDBACK_LIST, role: 'admin' },
    { id: 15, icon: MessageCircle, label: 'Submitted Feedback', path: '/parent-submitted-feedback-list', role: 'admin' },
    { id: 28, icon: Mic, label: 'Voice Feedback', path: ROUTES.ADMIN_SCHOOL_FEEDBACK, role: 'admin' },
    { id: 16, icon: ListChecks, label: 'All Parent Feedback', path: ROUTES.VIEW_ALL_PARENT_FEEDBACK, role: 'admin' },
    { id: 17, icon: MessageSquare, label: 'Search Feedback', path: ROUTES.PARENT_FEEDBACK_SEARCH, role: 'teacher' },
    { id: 18, icon: MessageCircle, label: 'Admin Feedback', path: ROUTES.ADMIN_FEEDBACK, role: 'admin' },

    // Account
    { id: 'section-account', label: 'Account', isSection: true },
    { id: 8, icon: Settings, label: 'Settings', path: ROUTES.SETTINGS },
    { id: 10, icon: Users, label: 'Profile', path: '/profile' },
    { id: 11, icon: IdCard, label: 'ID Card', path: '/id-card' },
    { id: 12, icon: IdCard, label: 'ID Card Details', path: '/idcarddetails', role: 'admin' },
    { id: 19, icon: IdCard, label: 'All ID Cards', path: '/id-cards', role: 'admin' },
    { id: 25, icon: Cake, label: 'Birthdays', path: '/birthdays' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <NetworkProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <NoInternet />
        {/* Header */}
        <header className="fixed top-0 w-full z-50 border-b bg-background">
          <div className="container mx-auto flex items-center justify-between p-4">
            <motion.div
              key="header-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <Link to="/dashboard" className="flex items-center gap-2">
                <motion.div
                  key="logo-icon"
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <BookOpen className="h-6 w-6 text-primary" />
                </motion.div>
                <AnimatedText
                  text="First Step Public School"
                  className="text-xl font-bold text-foreground hidden sm:block"
                  variant="slideUp"
                />
                <AnimatedText
                  text="First Step"
                  className="text-lg font-bold text-foreground sm:hidden"
                  variant="slideUp"
                />
              </Link>
            </motion.div>

            <motion.div
              key="header-right"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.email?.[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-primary"
                >
                  <LogOut className="h-5 w-5" />
                </Button>

              </div>
            </motion.div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex flex-1 pt-16">
          {/* Sidebar Overlay - Only visible on mobile */}
          <div
            className={cn(
              "fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-30 transition-opacity duration-200",
              "md:hidden md:pointer-events-none md:opacity-0",
              isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar */}
          <aside
            className={cn(
              "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-background border-r overflow-y-auto",
              "transition-transform duration-300 ease-in-out",
              "md:translate-x-0",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <nav className="h-full p-4 space-y-1 overflow-y-auto">
              {(() => {
                const userRole = profile?.role?.toUpperCase();
                const isVisible = (item: any) => {
                  if (!item.role) return true;
                  if (userRole === 'ADMIN') return true;
                  if (userRole === 'TEACHER') return item.role === 'teacher' || item.role === 'student';
                  if (userRole === 'STUDENT') return item.role === 'student';
                  return false;
                };
                // Filter items and remove empty sections
                const filtered = menuItems.filter((item, idx) => {
                  if (item.isSection) {
                    // Check if any non-section item after this section (until next section) is visible
                    for (let i = idx + 1; i < menuItems.length; i++) {
                      if (menuItems[i].isSection) break;
                      if (isVisible(menuItems[i])) return true;
                    }
                    return false;
                  }
                  return isVisible(item);
                });
                return filtered;
              })().map((item: any) => {
                if (item.isSection) {
                  return (
                    <div key={item.id} className="pt-4 pb-1 px-3 first:pt-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        {item.label}
                      </span>
                    </div>
                  );
                }

                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <div key={item.id}>
                    <Link to={item.path} onClick={() => setIsSidebarOpen(false)}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2 group",
                          isActive && "bg-primary/10 text-primary"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 ml-auto text-primary" />
                        )}
                      </Button>
                    </Link>
                  </div>
                );
              })}
              <InstallPWAButton />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 w-full md:pl-64">
            <NotificationPermissionBanner />
            <div className="container mx-auto p-4 sm:p-6 pb-20 md:pb-6">
              {children}
            </div>
          </main>
        </div>

        {/* Bottom Navigation - Mobile Only */}
        <BottomNav />
      </div>
    </NetworkProvider>
  );
}
