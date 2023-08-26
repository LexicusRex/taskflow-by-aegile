import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ setIsLoggedIn }) => {
  const location = useLocation();
  useEffect(() => {
    if (localStorage.getItem('token') !== null) {
      setIsLoggedIn(true);
    }
  }, [setIsLoggedIn]);

  return localStorage.getItem('token') !== null ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
export default ProtectedRoute;
