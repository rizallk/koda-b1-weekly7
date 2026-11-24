import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router';

export default function ProtectedRoute({ children }) {
  const { status, isAuthenticated } = useAuth();

  // console.log({ userRole, isAuthenticated });

  const location = useLocation();

  if (status === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-green-500" />

          <p className="text-sm">Memeriksa sesi pengguna...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
