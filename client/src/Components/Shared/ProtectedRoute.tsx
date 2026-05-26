import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthComponents/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

   
  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/#home" replace />;
  }
  return <Outlet />;
};