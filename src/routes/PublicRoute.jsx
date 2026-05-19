import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthStatus } from '../store/slices/authSlice';
import PageSkeleton from '../components/feedback/PageSkeleton';

/**
 * Used to wrap routes like /login that should redirect authenticated users
 * away (so they don't see the login screen if already signed in).
 */
const PublicRoute = ({ children }) => {
  const status = useSelector(selectAuthStatus);

  if (status === 'loading' || status === 'idle') {
    return <PageSkeleton />;
  }
  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;
