import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user
    const storedUser = localStorage.getItem('aurafit_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login logic
    const storedUsers = JSON.parse(localStorage.getItem('aurafit_users') || '{}');
    if (storedUsers[email] && storedUsers[email].password === password) {
      const userData = storedUsers[email];
      setUser(userData);
      localStorage.setItem('aurafit_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials. If new, please sign up.' };
  };

  const signup = (name, email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem('aurafit_users') || '{}');
    if (storedUsers[email]) {
      return { success: false, message: 'User already exists' };
    }
    
    // Generate a 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = { 
      name,
      email, 
      password,
      isVerified: false,
      verificationOtp: generatedOtp,
      onboardingCompleted: false,
      subscriptionPlan: 'Free',
      startDate: new Date().toISOString(),
      planExpiration: null,
      experienceLevel: 'New to working out'
    };
    
    storedUsers[email] = newUser;
    localStorage.setItem('aurafit_users', JSON.stringify(storedUsers));
    
    // Do not set user in session yet since they are not verified
    return { success: true, needsVerification: true, generatedOtp };
  };

  const verifyEmail = (email, otp) => {
    const storedUsers = JSON.parse(localStorage.getItem('aurafit_users') || '{}');
    if (storedUsers[email] && storedUsers[email].verificationOtp === String(otp)) {
      storedUsers[email].isVerified = true;
      localStorage.setItem('aurafit_users', JSON.stringify(storedUsers));
      
      setUser(storedUsers[email]);
      localStorage.setItem('aurafit_user', JSON.stringify(storedUsers[email]));
      return { success: true };
    }
    return { success: false, message: 'Invalid or expired OTP.' };
  };

  const requestPasswordReset = (email) => {
    const storedUsers = JSON.parse(localStorage.getItem('aurafit_users') || '{}');
    if (storedUsers[email]) {
      const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
      storedUsers[email].resetOtp = resetOtp;
      localStorage.setItem('aurafit_users', JSON.stringify(storedUsers));
      return { success: true, resetOtp };
    }
    return { success: false, message: 'Email not found.' };
  };

  const resetPassword = (email, otp, newPassword) => {
    const storedUsers = JSON.parse(localStorage.getItem('aurafit_users') || '{}');
    if (storedUsers[email] && storedUsers[email].resetOtp === String(otp)) {
      storedUsers[email].password = newPassword;
      delete storedUsers[email].resetOtp;
      localStorage.setItem('aurafit_users', JSON.stringify(storedUsers));
      return { success: true };
    }
    return { success: false, message: 'Invalid Reset OTP.' };
  };

  const completeOnboarding = (profileData) => {
    if (!user) return;
    const updatedUser = { ...user, ...profileData, onboardingCompleted: true };
    setUser(updatedUser);
    localStorage.setItem('aurafit_user', JSON.stringify(updatedUser));
    
    const storedUsers = JSON.parse(localStorage.getItem('aurafit_users') || '{}');
    storedUsers[user.email] = updatedUser;
    localStorage.setItem('aurafit_users', JSON.stringify(storedUsers));
  };

  const updateSubscription = (plan, months) => {
    if (!user) return;
    const expiration = new Date();
    expiration.setMonth(expiration.getMonth() + months);
    
    const updatedUser = { 
      ...user, 
      subscriptionPlan: plan,
      planExpiration: expiration.toISOString()
    };
    
    setUser(updatedUser);
    localStorage.setItem('aurafit_user', JSON.stringify(updatedUser));
    
    const storedUsers = JSON.parse(localStorage.getItem('aurafit_users') || '{}');
    storedUsers[user.email] = updatedUser;
    localStorage.setItem('aurafit_users', JSON.stringify(storedUsers));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aurafit_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, completeOnboarding, updateSubscription, verifyEmail, requestPasswordReset, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
