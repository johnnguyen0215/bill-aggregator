import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../providers/auth';
import { routes } from '../routes';

export const RequireAuth = () => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Navigate replace to={routes.signin} />;
  }

  return <Outlet />;
};
