import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedEmail }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user's email matches the allowed email
  if (allowedEmail && user.email !== allowedEmail) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
