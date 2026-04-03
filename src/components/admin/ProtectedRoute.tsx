import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'rgb(10, 10, 15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgb(149, 149, 176)',
        fontFamily: 'var(--font-body)',
      }}>
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
