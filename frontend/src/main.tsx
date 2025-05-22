import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'; // Tailwind or global styles

const GOOGLE_CLIENT_ID = '150704551255-cg3084jchdmpk894dndhej5nsaov00fk.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
    <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
