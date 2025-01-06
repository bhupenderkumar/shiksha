import { useAuth } from '../lib/auth';
import { Link } from 'react-router-dom';

export default function MainLayout({ children }) {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Shiksha</h1>
          <nav>
            <Link to="/" className="mr-4">Home</Link>
            {profile?.role === 'STUDENT' && (
              <Link to="/student-dashboard" className="mr-4">Student Dashboard</Link>
            )}
            {/* Add other links here */}
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-blue-600 text-white p-4 text-center">
        &copy; 2025 Shiksha
      </footer>
    </div>
  );
}
