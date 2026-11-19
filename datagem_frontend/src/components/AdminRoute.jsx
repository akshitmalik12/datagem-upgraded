import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#090a0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Strictly allow ONLY the designated super-admin emails. No tier-based or enterprise bypass.
  const ADMIN_EMAILS = ['aakshitmalik@gmail.com', 'akshitmalik1203@gmail.com'];
  const isAdmin = ADMIN_EMAILS.includes(user?.email?.trim().toLowerCase());

  if (!isAdmin) {
    return <Navigate to="/chat" replace />;
  }

  return children;
}
