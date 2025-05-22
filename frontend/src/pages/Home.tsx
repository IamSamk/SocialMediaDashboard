import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../services/api';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const token = tokenResponse.access_token;
        const response = await api.post('/auth/oauth-login', { token });
        if (response.data.message === 'Login successful!') {
          localStorage.setItem('token', token);
          localStorage.setItem('userId', response.data.user_id);
          localStorage.setItem('userEmail', response.data.user.email);
          localStorage.setItem('userName', response.data.user.name);
          localStorage.setItem('userPicture', response.data.user.picture);
          navigate('/dashboard');
        } else {
          alert('Login failed: ' + (response.data.error || 'Unknown error'));
        }
      } catch (error: any) {
        // Properly format error message
        const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
        alert('Login failed: ' + errorMessage);
      }
    },
    onError: () => alert('Google Sign-In failed'),
    scope: 'openid email profile https://www.googleapis.com/auth/youtube.readonly',
    flow: 'implicit',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Analytics Pro+</h1>
          <p className="text-gray-600">Sign in to access your analytics dashboard</p>
        </div>
        <div className="space-y-4">
          <div className="flex justify-center">
            <button
              onClick={() => login()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.13 0 24 0 14.82 0 6.71 5.48 2.69 13.44l7.98 6.2C12.13 13.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M9.67 28.09c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C-1.13 16.09-1.13 31.91 1.69 37.91l7.98-6.2z"/><path fill="#EA4335" d="M24 44c6.13 0 11.64-2.36 15.85-6.44l-7.19-5.6c-2.01 1.35-4.57 2.14-8.66 2.14-6.38 0-11.87-3.59-13.33-8.74l-7.98 6.2C6.71 42.52 14.82 48 24 48z"/></g></svg>
              Sign in with Google
            </button>
          </div>
          <div className="text-center text-sm text-gray-500 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 