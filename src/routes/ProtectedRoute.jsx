import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthStatus } from '../store/slices/authSlice';
import PageSkeleton from '../components/feedback/PageSkeleton';

const ProtectedRoute = ({ children }) => {
  const status = useSelector(selectAuthStatus);
  const location = useLocation();

  if (status === 'loading' || status === 'idle') {
    return <PageSkeleton />;
  }
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

export default ProtectedRoute;
