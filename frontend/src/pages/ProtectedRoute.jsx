import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check for the auth token in local storage
  const token = localStorage.getItem('authToken');

  // If the token exists, render the child component (your DashboardPage)
  // The <Outlet /> component is a placeholder for whatever child route is nested inside.
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;