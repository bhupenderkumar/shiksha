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
  MessageSquare
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/lib/auth';
import { ROUTES } from '@/constants/app-constants';
import { AnimatedText } from './ui/animated-text';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 1, icon: Home, label: 'Dashboard', path: ROUTES.DASHBOARD },
    { id: 2, icon: Users, label: 'Students', path: ROUTES.STUDENTS },
    { id: 3, icon: BookOpen, label: 'Homework', path: ROUTES.HOMEWORK },
    { id: 4, icon: BookOpen, label: 'Classwork', path: ROUTES.CLASSWORK },
    { id: 5, icon: Calendar, label: 'Attendance', path: ROUTES.ATTENDANCE },
    { id: 6, icon: CreditCard, label: 'Fees', path: ROUTES.FEES },
    { id: 7, icon: MessageSquare, label: 'Feedback', path: ROUTES.FEEDBACK },
    { id: 8, icon: Settings, label: 'Settings', path: ROUTES.SETTINGS },
  ];

  const variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut'
      }
    })
  };

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-background/95">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
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
              className="md:hidden"
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
                text="Shiksha"
                className="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
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
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
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
        {/* Sidebar Overlay */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              key="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-screen w-64 bg-background/70 backdrop-blur-sm border-r",
            "transition-transform duration-300 ease-in-out",
            "md:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="h-full p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  custom={item.id}
                  initial="hidden"
                  animate="visible"
                  variants={variants}
                >
                  <Link to={item.path} onClick={() => setIsSidebarOpen(false)}>  
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2 group",
                        isActive && "bg-primary/10 text-primary"
                      )}
                    >
                      <motion.div
                        key={`icon-${item.id}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="h-5 w-5" />
                      </motion.div>
                      <span>{item.label}</span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto text-primary" />
                      )}
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full md:pl-64">
          <div className="container mx-auto p-6">
            <motion.div
              key="main-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
