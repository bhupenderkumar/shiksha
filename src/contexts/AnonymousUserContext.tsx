import React, { createContext, useContext, useState, useEffect } from 'react';
import { anonymousUserService, AnonymousUser } from '@/services/anonymousUserService';

interface AnonymousUserContextType {
  anonymousUser: AnonymousUser | null;
  loading: boolean;
  registerUser: (name: string, mobileNumber?: string) => Promise<AnonymousUser | null>;
  updateUser: (name: string, mobileNumber?: string) => Promise<AnonymousUser | null>;
  logout: () => void;
}

const AnonymousUserContext = createContext<AnonymousUserContextType>({
  anonymousUser: null,
  loading: true,
  registerUser: async () => null,
  updateUser: async () => null,
  logout: () => {},
});

const LOCAL_STORAGE_KEY = 'anonymous_user';

export function AnonymousUserProvider({ children }: { children: React.ReactNode }) {
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from local storage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as AnonymousUser;
          
          // Verify user still exists in the database
          const user = await anonymousUserService.getUserById(parsedUser.id);
          
          if (user) {
            setAnonymousUser(user);
            // Update last active timestamp
            anonymousUserService.updateLastActive(user.id);
          } else {
            // User no longer exists in the database
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading anonymous user:', error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register a new anonymous user
  const registerUser = async (name: string, mobileNumber?: string): Promise<AnonymousUser | null> => {
    try {
      const user = await anonymousUserService.createOrUpdateUser(name, mobileNumber);
      
      if (user) {
        setAnonymousUser(user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error registering anonymous user:', error);
      return null;
    }
  };

  // Update an existing anonymous user
  const updateUser = async (name: string, mobileNumber?: string): Promise<AnonymousUser | null> => {
    if (!anonymousUser) return null;

    try {
      const updatedUser = await anonymousUserService.createOrUpdateUser(name, mobileNumber);
      
      if (updatedUser) {
        setAnonymousUser(updatedUser);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating anonymous user:', error);
      return null;
    }
  };

  // Log out the anonymous user
  const logout = () => {
    setAnonymousUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const value = {
    anonymousUser,
    loading,
    registerUser,
    updateUser,
    logout,
  };

  return (
    <AnonymousUserContext.Provider value={value}>
      {children}
    </AnonymousUserContext.Provider>
  );
}

// Custom hook to use anonymous user context
export const useAnonymousUser = () => {
  const context = useContext(AnonymousUserContext);
  if (!context) {
    throw new Error('useAnonymousUser must be used within an AnonymousUserProvider');
  }
  return context;
};
