import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { createCustomSupabaseClient } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (emailOrUsername: string, passwordOrPin: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: { name: string; username: string; email?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  addUserAccount: (newUser: Omit<User, 'id'>, passwordOrPin: string) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (userId: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updatePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  adminResetPassword: (userId: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  updateAdminAccountDetails: (data: {
    currentPassword: string;
    newUsername?: string;
    newEmail?: string;
    newPassword?: string;
    newName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteUserAccount: (id: string) => Promise<{ success: boolean; error?: string }>;
  lockSession: () => void;
  isLocked: boolean;
  unlockSession: (pinOrPass: string) => Promise<boolean>;
}

// Retained for any legacy functions that might still import it
export async function hashString(str: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); // Populated by profiles in a real scenario
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize Supabase Auth Session
  useEffect(() => {
    let subscription: any = null;

    const initAuth = async () => {
      const client = createCustomSupabaseClient();
      if (!client) {
        setIsInitializing(false);
        return;
      }
      
      const { data: { session } } = await client.auth.getSession();
      if (session && session.user) {
        await loadUserProfile(session.user.id);
      }
      
      // Listen for auth state changes
      const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
      
      subscription = authListener.subscription;
      setIsInitializing(false);
    };

    initAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUserId: string) => {
    const client = createCustomSupabaseClient();
    if (!client) return;

    const { data: profile } = await client.from('profiles').select('*').eq('id', authUserId).single();
    
    if (profile) {
      const loggedInUser: User = {
        id: profile.id, 
        username: profile.username,
        name: profile.name,
        role: profile.role || 'owner',
        email: profile.email || '',
        passwordHash: '', 
        createdAt: profile.created_at
      };
      setUser(loggedInUser);
    } else {
      // Fallback if trigger didn't run or profile missing
      const { data: { user: authUser } } = await client.auth.getUser();
      if (authUser) {
         setUser({
            id: authUser.id,
            username: authUser.user_metadata?.username || 'user',
            name: authUser.user_metadata?.name || 'User',
            role: 'owner',
            email: authUser.email || '',
            passwordHash: '',
            createdAt: authUser.created_at
         });
      }
    }
  };

  const signUp = async (data: { name: string; username: string; email?: string; password: string }) => {
    const client = createCustomSupabaseClient();
    if (!client) return { success: false, error: 'Database connection error' };

    const cleanUsername = data.username.trim().toLowerCase();
    const emailToUse = data.email?.trim() || `${cleanUsername}@rkfitness.com`;

    const { error } = await client.auth.signUp({
      email: emailToUse,
      password: data.password,
      options: {
        data: {
          username: cleanUsername,
          name: data.name.trim()
        }
      }
    });

    if (error) return { success: false, error: error.message };
    
    return { success: true };
  };

  const login = async (emailOrUsername: string, passwordOrPin: string) => {
    const client = createCustomSupabaseClient();
    if (!client) return { success: false, error: 'Database connection error' };
    
    const cleanInput = emailOrUsername.trim().toLowerCase();
    let emailToLogin = cleanInput;

    if (!cleanInput.includes('@')) {
      emailToLogin = `${cleanInput}@rkfitness.com`;
    }

    const { error } = await client.auth.signInWithPassword({
      email: emailToLogin,
      password: passwordOrPin
    });

    if (error) {
      return { success: false, error: error.message };
    }
    
    setIsLocked(false);
    return { success: true };
  };

  const logout = async () => {
    const client = createCustomSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    setUser(null);
    setIsLocked(false);
  };

  const addUserAccount = async (newUser: Omit<User, 'id'>, passwordOrPin: string) => {
    return signUp({ name: newUser.name, username: newUser.username, email: newUser.email, password: passwordOrPin });
  };

  const quickLogin = async (userId: string) => {
    return { success: false, error: 'Quick login is disabled. Please log in with your password.' };
  };

  const updatePassword = async (currentPass: string, newPass: string) => {
    const client = createCustomSupabaseClient();
    if (!client) return { success: false, error: 'Database error' };
    
    const { error } = await client.auth.updateUser({ password: newPass });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const adminResetPassword = async (userId: string, newPass: string) => {
    return { success: false, error: 'Admin password reset requires Supabase Admin API.' };
  };

  const updateAdminAccountDetails = async (data: any) => {
    return { success: false, error: 'Please update account details through the Supabase Dashboard.' };
  };

  const deleteUserAccount = async (id: string) => {
    return { success: false, error: 'Account deletion must be done via the Supabase Auth Dashboard.' };
  };

  const lockSession = () => setIsLocked(true);
  
  const unlockSession = async (pinOrPass: string) => {
    setIsLocked(false);
    return true;
  };

  if (isInitializing) {
    return <div className="min-h-screen bg-[#080b11] text-slate-100 flex items-center justify-center">Loading Secure Authentication...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: !!user,
        login,
        signUp,
        addUserAccount,
        quickLogin,
        logout,
        updatePassword,
        adminResetPassword,
        updateAdminAccountDetails,
        deleteUserAccount,
        lockSession,
        isLocked,
        unlockSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
