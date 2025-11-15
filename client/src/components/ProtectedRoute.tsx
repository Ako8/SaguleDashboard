import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Only redirect if we're done loading and there's no user
    // Also check if token exists - if token exists but user is null, 
    // it might be validating, so wait a bit
    if (!isLoading) {
      const token = localStorage.getItem('auth_token');
      if (!user && !token) {
        navigate('/login');
      } else if (!user && token) {
        // Token exists but user is null - might be validating
        // Give it a moment, then redirect if still no user
        const timeout = setTimeout(() => {
          if (!user) {
            navigate('/login');
          }
        }, 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a token but no user yet, show loading
  const token = localStorage.getItem('auth_token');
  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Validating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
