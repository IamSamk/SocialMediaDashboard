import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      api.post('/auth/verify-token', { credential: token })
        .then(res => {
          if (res.data.success) {
            navigate('/dashboard');
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userPicture');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          localStorage.removeItem('userPicture');
        });
    }
  }, [navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      console.log('Google credential:', credentialResponse);
      // Verify token with backend
      const response = await api.post('/auth/verify-token', {
        credential: credentialResponse.credential
      });
      console.log('Backend response:', response.data);

      if (response.data.success) {
        // Store user info and token
        localStorage.setItem('token', credentialResponse.credential);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userEmail', response.data.email);
        localStorage.setItem('userName', response.data.name);
        localStorage.setItem('userPicture', response.data.picture);

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        alert('Login failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: ' + error);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign-In failed');
    alert('Google Sign-In failed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Analytics Pro+</h1>
          <p className="text-gray-600">Sign in to access your analytics dashboard</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_blue"
              shape="rectangular"
              text="signin_with"
              size="large"
            />
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
