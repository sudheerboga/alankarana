import { useEffect, useRef, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { router } from '../routes/router';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAuthListener } from '../hooks/useAuthListener';
import { useCategoriesSync } from '../hooks/useCategoriesSync';
import ToastHost from '../components/feedback/ToastHost';
import ConfirmDialogHost from '../components/feedback/ConfirmDialogHost';
import SplashScreen from '../components/common/SplashScreen';
import { selectAuthStatus } from '../store/slices/authSlice';

const MINIMUM_SPLASH_MS = 1600; // let the animation play before fading out

const App = () => {
  useAuthListener();
  useCategoriesSync();
  useOnlineStatus();

  const status = useSelector(selectAuthStatus);
  const [splashExiting, setSplashExiting] = useState(false);
  const [splashGone, setSplashGone] = useState(false);
  const resolvedRef = useRef(false);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    const isResolved = status !== 'idle' && status !== 'loading';
    if (isResolved && !resolvedRef.current) {
      resolvedRef.current = true;
      const elapsed = Date.now() - mountTimeRef.current;
      const remaining = Math.max(0, MINIMUM_SPLASH_MS - elapsed);
      const timer = setTimeout(() => {
        setSplashExiting(true);
        // unmount after the CSS fade-out finishes (0.38s)
        setTimeout(() => setSplashGone(true), 400);
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastHost />
      <ConfirmDialogHost />
      {!splashGone && <SplashScreen done={splashExiting} />}
    </>
  );
};

export default App;
