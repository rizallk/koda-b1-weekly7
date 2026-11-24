import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export const CustomerRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  const isCustomer = user?.roles?.includes('CUSTOMER') ?? false;

  if (!isCustomer) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
