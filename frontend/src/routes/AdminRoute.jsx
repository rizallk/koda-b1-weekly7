import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  const isAdmin = user?.roles?.includes('ADMIN') ?? false;

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
