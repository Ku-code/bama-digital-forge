import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'superadmin' | 'admin' | 'member';
export type MemberStatus = 'approved' | 'pending' | 'rejected';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider?: 'google' | 'email';
  bio?: string;
  hashtags?: string[];
  location?: string;
  website?: string;
  phone?: string;
  role?: UserRole;
  status?: MemberStatus;
  createdAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // If user doesn't have role, set as superadmin if first user, otherwise member
        if (!parsedUser.role) {
          const members = JSON.parse(localStorage.getItem('bamas_members') || '[]');
          if (members.length === 0) {
            parsedUser.role = 'superadmin';
            parsedUser.status = 'approved';
          } else {
            parsedUser.role = 'member';
            parsedUser.status = parsedUser.status || 'pending';
          }
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    // Check if this is a new user or existing
    const existingMembers = JSON.parse(localStorage.getItem('bamas_members') || '[]');
    const existingMember = existingMembers.find((m: User) => m.id === userData.id || m.email === userData.email);
    
    let finalUserData: User;
    
    if (existingMember) {
      // Existing member - use their stored data
      finalUserData = { ...existingMember, ...userData };
    } else {
      // New user - check if first user (superadmin) or regular (pending)
      const isFirstUser = existingMembers.length === 0;
      finalUserData = {
        ...userData,
        role: isFirstUser ? 'superadmin' : 'member',
        status: isFirstUser ? 'approved' : 'pending',
        createdAt: new Date().toISOString(),
      };
      
      // Add to members list
      const updatedMembers = [...existingMembers, finalUserData];
      localStorage.setItem('bamas_members', JSON.stringify(updatedMembers));
    }
    
    setUser(finalUserData);
    localStorage.setItem('user', JSON.stringify(finalUserData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isSuperAdmin,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
