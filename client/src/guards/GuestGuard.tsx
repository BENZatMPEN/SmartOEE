import { ReactNode } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import useAuth from '../hooks/useAuth';
import { PATH_DASHBOARD } from '../routes/paths';

type GuestGuardProps = {
  children: ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
  const [searchParams] = useSearchParams();

  const { isAuthenticated, isInitialized } = useAuth();

  if (isAuthenticated) {
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      return <Navigate to={returnUrl} />;
    }
    return <Navigate to={PATH_DASHBOARD.root} />;
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
