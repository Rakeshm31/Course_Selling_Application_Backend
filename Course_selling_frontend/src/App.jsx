import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import { ThemeProvider } from './components/ThemeContext';

// Components
import Navbar from './navbar/Navbar';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';

import AdminDashboard from './admin/Admindashboard';
import UserDashboard from './user/Userdashboard';

// Protection
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <div className="App min-h-screen transition-colors duration-300">
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin/admindashboard" 
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected User Routes */}
              <Route 
                path="/user/userdashboard" 
                element={
                  <ProtectedRoute allowedRole="user">
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Fallback Routes */}
              <Route path="/admin/*" element={<Navigate to="/admin/admindashboard" replace />} />
              <Route path="/user/*" element={<Navigate to="/user/userdashboard" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
