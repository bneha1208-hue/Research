import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: "user_001",
  name: "Adv. Rajesh Varma",
  email: "rajesh.varma@lawchamber.in",
  role: "Lawyer",
  phone: "+91 98401 23456",
  token: "user_token_demo_001"
};

const AVAILABLE_ROLES = [
  "Lawyer",
  "Legal Researcher",
  "Law Student",
  "Legal Intern",
  "Law Firm"
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lp_auth_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const updateUser = (userData) => {
    const updated = {
      ...user,
      ...userData,
      token: userData.token || `user_token_${Date.now()}`
    };
    setUser(updated);
    localStorage.setItem('lp_auth_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles: AVAILABLE_ROLES,
        isAuthModalOpen,
        setIsAuthModalOpen,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
