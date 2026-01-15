import React, { createContext, useContext, useState, useEffect } from 'react';
import cognitoService from '../services/cognitoService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already authenticated on app load
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const result = await cognitoService.getCurrentUser();
      if (result.success) {
        setUser(result.user);
      }
    } catch (error) {
      console.log('No authenticated user found');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    const result = await cognitoService.signIn(username, password);
    
    if (result.success) {
      setUser(result.user);
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    const result = await cognitoService.signOut();
    
    if (result.success) {
      setUser(null);
    }
    setLoading(false);
    return result;
  };

  const signup = async (username, password, email) => {
    setLoading(true);
    setError(null);
    
    const result = await cognitoService.signUp(username, password, email);
    setLoading(false);
    
    if (!result.success) {
      setError(result.error);
    }
    
    return result;
  };

  const confirmSignup = async (username, confirmationCode) => {
    setLoading(true);
    setError(null);
    
    const result = await cognitoService.confirmSignUp(username, confirmationCode);
    setLoading(false);
    
    if (!result.success) {
      setError(result.error);
    }
    
    return result;
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    signup,
    confirmSignup,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};