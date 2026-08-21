import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster as HotToaster } from 'react-hot-toast';

import { App } from './App';
import { store } from '@/store';
import { CategoryProvider } from '@/context/CategoryContext';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import '@/utils/i18n';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider>
            <CategoryProvider>
              <App />
              <HotToaster position="top-right" />
            </CategoryProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
);