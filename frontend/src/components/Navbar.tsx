import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };
  return (
    <nav className="bg-white shadow flex items-center justify-between px-6 py-3 mb-8">
      <div className="flex items-center space-x-6">
        <Link to="/dashboard" className="text-xl font-bold text-blue-700 hover:text-blue-900">Analytics Pro+</Link>
        <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>
        <Link to="/analytics" className="text-gray-700 hover:text-blue-600 font-medium">Analytics</Link>
      </div>
      <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
    </nav>
  );
};

export default Navbar; 