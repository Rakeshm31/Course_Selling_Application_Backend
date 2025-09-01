import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { useTheme } from "../components/ThemeContext";
import ThemeToggle from '../components/ThemeToggle';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const firstName = localStorage.getItem("firstName");
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    navigate("/login");
  };

  const isActiveLink = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-900/95 border-gray-800' 
        : 'bg-white/95 border-gray-200'
    } backdrop-blur-md border-b shadow-lg`}>
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LearnHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                isActiveLink('/') 
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-blue-100 text-blue-700'
                  : isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Explore
            </Link>

            {!token ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    isActiveLink('/login') 
                      ? isDarkMode 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-blue-100 text-blue-700'
                      : isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* User Profile */}
                <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                } border`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {firstName || 'User'}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">
                      {role === 'admin' ? 'Instructor' : 'Student'}
                    </div>
                  </div>
                </div>

                {/* Dashboard Links */}
                {role === "admin" ? (
                  <Link 
                    to="/admin/admindashboard" 
                    className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                      isActiveLink('/admin/admindashboard') 
                        ? isDarkMode 
                          ? 'bg-purple-600 text-white shadow-lg' 
                          : 'bg-purple-100 text-purple-700'
                        : isDarkMode 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/user/userdashboard" 
                    className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                      isActiveLink('/user/userdashboard') 
                        ? isDarkMode 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-blue-100 text-blue-700'
                        : isDarkMode 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    My Learning
                  </Link>
                )}

                {/* Logout Button */}
                <button 
                  onClick={handleLogout} 
                  className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    isDarkMode 
                      ? 'text-red-400 hover:text-white hover:bg-red-600' 
                      : 'text-red-600 hover:text-white hover:bg-red-600'
                  }`}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <ThemeToggle />
            <button 
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`${isDarkMode ? 'bg-gray-300' : 'bg-gray-600'} block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                  isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                }`}></span>
                <span className={`${isDarkMode ? 'bg-gray-300' : 'bg-gray-600'} block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`${isDarkMode ? 'bg-gray-300' : 'bg-gray-600'} block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                  isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                }`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className={`py-4 space-y-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <Link 
              to="/" 
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            
            {!token ? (
              <>
                <Link 
                  to="/login" 
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {firstName || 'User'}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        {role === 'admin' ? 'Instructor' : 'Student'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {role === "admin" ? (
                  <Link 
                    to="/admin/admindashboard" 
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/user/userdashboard" 
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Learning
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode ? 'text-red-400 hover:text-white hover:bg-red-600' : 'text-red-600 hover:text-white hover:bg-red-600'
                  }`}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
