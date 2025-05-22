// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Dashboard from './components/Dashboard';
import Analytics from './pages/Analytics';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';

const GOOGLE_CLIENT_ID = '150704551255-cg3084jchdmpk894dndhej5nsaov00fk.apps.googleusercontent.com';

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <><Navbar /><Dashboard /></>
            </PrivateRoute>
          }
        />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </GoogleOAuthProvider>
  );
};

export default App;
