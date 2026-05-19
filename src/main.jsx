import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from './theme/ThemeProvider';
import App from './app/App';
import './theme/global.css';

// Mount the app, replacing the static splash from index.html
const rootEl = document.getElementById('root');
// Clear splash before mount so we don't get a flash of empty
rootEl.innerHTML = '';

createRoot(rootEl).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
