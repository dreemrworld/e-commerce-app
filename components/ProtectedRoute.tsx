import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // Optional: for better UX

interface ProtectedRouteProps {
  children: JSX.Element;
  // Add role-based access control if needed
  // allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, session } = useAuth();
  const location = ReactRouterDOM.useLocation();

  // Optional: Show a loading spinner while session is being checked
  // This depends on how quickly your session resolves.
  // If `session` is initially null and then populated, this can prevent a flash of the login page.
  const isLoadingSession = session === null && typeof isAuthenticated === 'undefined'; // Adjust based on initial state values

  if (isLoadingSession) {
     return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <ReactRouterDOM.Navigate to="/login" state={{ from: location }} replace />;
  }

  // Example: Role-based access (if you implement roles in Supabase)
  // const userRoles = user?.app_metadata?.roles || [];
  // if (allowedRoles && !allowedRoles.some(role => userRoles.includes(role))) {
  //   // Redirect to an unauthorized page or home
  //   return <ReactRouterDOM.Navigate to="/unauthorized" replace />;
  // }

  return children;
};

export default ProtectedRoute;