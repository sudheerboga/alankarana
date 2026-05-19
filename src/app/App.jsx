import { RouterProvider } from 'react-router-dom';
import { router } from '../routes/router';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAuthListener } from '../hooks/useAuthListener';
import { useCategoriesSync } from '../hooks/useCategoriesSync';
import ToastHost from '../components/feedback/ToastHost';
import ConfirmDialogHost from '../components/feedback/ConfirmDialogHost';

/**
 * App root. Order matters:
 *  - Auth listener runs once and keeps Redux in sync with Firebase auth state
 *  - Categories sync runs after auth (no-ops until user is signed in)
 *  - Online status hook syncs network state to Redux
 *  - Router renders pages (which may dispatch toasts/confirms)
 *  - ToastHost + ConfirmDialogHost render OUTSIDE the router so they survive
 *    route changes and sit above all page content.
 */
const App = () => {
  useAuthListener();
  useCategoriesSync();
  useOnlineStatus();

  return (
    <>
      <RouterProvider router={router} />
      <ToastHost />
      <ConfirmDialogHost />
    </>
  );
};

export default App;
