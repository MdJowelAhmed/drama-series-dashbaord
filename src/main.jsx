import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster, toast } from 'sonner';
import App from './App';
import { store } from './redux/store';
import ErrorBoundary from './components/share/ErrorBoundary';
import { getErrorMessage } from './utils/errorHandler';
import './index.css';

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason?.name === 'AbortError') return;
  if (import.meta.env.DEV) {
    console.error('Unhandled promise rejection:', reason);
  }
  toast.error(getErrorMessage(reason, 'Unexpected error occurred'));
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
