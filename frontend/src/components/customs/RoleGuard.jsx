import { useAuth } from '../Hooks/useAuth';

export const RoleGuard = ({ allowRoles, children }) => {
  const { user, isAuthenticated } = useAuth();
  const currentRoles = user?.roles ?? [];
  const hasPermission = allowRoles.some((role) => currentRoles.includes(role));

  if (!isAuthenticated || !hasPermission) return null;
  return children;
};
