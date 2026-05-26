import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './Styles/Index.css';
import { AuthProvider } from './Components/AuthComponents/AuthContext';
import { ToastProvider } from './Components/Shared/ToastContext';
import { AuthModalProvider } from './Components/AuthComponents/AuthModalContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AuthModalProvider>
            <App />
          </AuthModalProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);