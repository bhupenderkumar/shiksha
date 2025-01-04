import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

const Header = () => {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed w-full top-0 z-50 px-4 py-2">
      <nav className="glass-effect px-6 py-4 rounded-2xl max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover-lift">
            <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
              Shiksha
            </span>
          </Link>

          <div className="flex items-center space-x-8">
            <NavLink href="/" text="Home" active={router.pathname === '/'} />
            <NavLink href="/courses" text="Courses" active={router.pathname === '/courses'} />
            <NavLink href="/about" text="About" active={router.pathname === '/about'} />
            {profile ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-2"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <Avatar>
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-white font-medium">{profile.name}</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="px-6 py-2.5 rounded-xl glass-effect hover-lift text-white font-medium">
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

const NavLink = ({ href, text, active }: { href: string; text: string; active: boolean }) => (
  <Link
    href={href}
    className={`nav-link text-sm font-medium ${
      active ? 'text-white active' : 'text-gray-200 hover:text-white'
    }`}
  >
    {text}
  </Link>
);

export default Header;
