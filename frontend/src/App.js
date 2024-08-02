import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Upload from './components/Upload';
import Wall from './components/Wall';
import Verify from './components/Verify';
import './assets/App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/auth/check-auth', {
          credentials: 'include',
        });
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Failed to check authentication', error);
      }
    };

    checkAuth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        {isAuthenticated && (
          <>
            <Route path="/upload" element={<Upload />} />
            <Route path="/wall" element={<Wall />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;





