
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (rawUser) => {
      setLoading(true);
      if (rawUser && rawUser.emailVerified) {
        setUser(rawUser);
        try {
          const userRef = doc(db, "users", rawUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
              const role = userSnap.data().role || 'patient';
              setUserRole(role);
              
              const targetPath = `/${role}`;
              if (!pathname.startsWith(targetPath)) {
                router.replace(targetPath);
              }
          } else {
             await firebaseSignOut(auth);
             setUser(null);
             setUserRole(null);
             if (pathname !== '/') router.replace('/');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          await firebaseSignOut(auth);
          setUser(null);
          setUserRole(null);
          if (pathname !== '/') router.replace('/');
        }
      } else {
        setUser(null);
        setUserRole(null);
        if (pathname !== '/') {
            router.replace('/');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const value = {
    user,
    loading,
    signOut,
    userRole,
  };

  if (loading && !user) {
      return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

    