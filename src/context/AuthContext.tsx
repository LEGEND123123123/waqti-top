import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { UserRole } from '../types/verification';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = user !== null;

  useEffect(() => {
    // Check active session on mount
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const createUserProfile = async (userId: string) => {
    try {
      // Get the auth user details
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser.user) {
        console.error('Error getting auth user:', authError);
        return;
      }

      // Create user profile with data from auth
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'User',
          email: authUser.user.email || '',
          phone: authUser.user.user_metadata?.phone || '',
          balance: 2
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          balance: data.balance || 2,
          joinedAt: new Date(data.created_at),
          avatar: data.avatar_url,
          isVerified: data.is_verified || false,
          role: data.role || 'client'
        });
        
        // Set user role
        const role: UserRole = {
          type: 'client',
          permissions: ['create_projects', 'hire_freelancers'],
          verificationRequired: false,
          verificationStatus: 'pending'
        };
        setUserRole(role);
      }
    } catch (error) {
      console.error('Profile creation error:', error);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          balance: data.balance || 2,
          joinedAt: new Date(data.created_at),
          avatar: data.avatar_url,
          isVerified: data.is_verified || false,
          role: data.role || 'client'
        });
        
        // Set user role based on database data
        const role: UserRole = {
          type: data.role || 'client',
          permissions: data.role === 'freelancer' ? ['create_services', 'submit_proposals'] : ['create_projects', 'hire_freelancers'],
          verificationRequired: data.role === 'freelancer',
          verificationStatus: data.verification_status || 'pending'
        };
        setUserRole(role);
      } else {
        // User profile doesn't exist yet, try to create it from auth user
        console.log('User profile not found, attempting to create from auth user');
        await createUserProfile(userId);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        console.error('Login error:', error);
        return { 
          success: false, 
          error: error.message === 'Invalid login credentials' 
            ? 'Invalid email or password. Please check your credentials and try again.'
            : error.message || 'Login failed. Please try again.'
        };
      }

      if (data.user) {
        await fetchUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'Login failed. Please try again.' };
    } catch (error) {
      console.error('Login exception:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // First, sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            phone: phone.trim()
          }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        return { 
          success: false, 
          error: signUpError.message || 'Registration failed. Please try again.' 
        };
      }

      if (!authData.user) {
        return { 
          success: false, 
          error: 'Registration failed. Please try again.' 
        };
      }

      // Profile will be created automatically in fetchUserProfile if it doesn't exist

      // If email confirmation is disabled, the user will be automatically signed in
      if (authData.session) {
        await fetchUserProfile(authData.user.id);
      }

      return { success: true };
    } catch (error) {
      console.error('Registration exception:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Logout exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error.message };
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    } catch (error) {
      console.error('Profile update exception:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const setUserRoleFunction = (role: UserRole) => {
    setUserRole(role);
  };

  const value = {
    user,
    userRole,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    setUserRole: setUserRoleFunction
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};