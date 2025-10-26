import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentUser = useSessionStore.getState().getUserData()?.username;

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
