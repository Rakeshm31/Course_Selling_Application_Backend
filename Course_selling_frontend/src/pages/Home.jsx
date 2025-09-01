// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { API_ENDPOINTS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

function Home() {
  const [courses, setCourses] = useState([]);
  const [adminDetails, setAdminDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchCoursesWithAdminDetails();
  }, []);

  // Extract YouTube video ID from various YouTube URL formats
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Generate YouTube thumbnail URL
  const getYouTubeThumbnail = (videoUrl) => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return '/api/placeholder/400/225'; // Fallback placeholder
  };

  const fetchCoursesWithAdminDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch all courses
      const coursesRes = await axios.get(API_ENDPOINTS.COURSE_PREVIEW);
      const coursesData = coursesRes.data.courses;
      setCourses(coursesData);

      // Get unique creator IDs and fetch admin details
      const uniqueCreatorIds = [...new Set(coursesData.map(course => course.creatorId))];
      await fetchAdminDetails(uniqueCreatorIds);
      
    } catch (error) {
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminDetails = async (creatorIds) => {
    const adminDetailsMap = {};
    
    if (token && role === 'admin') {
      try {
        const adminCoursesRes = await axios.get(API_ENDPOINTS.ADMIN_COURSES, {
          headers: { Authorization: token }
        });
        
        // Extract admin details from populated courses
        adminCoursesRes.data.courses.forEach(course => {
          if (course.creatorId && typeof course.creatorId === 'object') {
            adminDetailsMap[course.creatorId._id] = {
              firstName: course.creatorId.firstName,
              lastName: course.creatorId.lastName,
              fullName: `${course.creatorId.firstName} ${course.creatorId.lastName}`
            };
          }
        });
      } catch (error) {
        console.log('Failed to fetch admin details');
      }
    }

    // For missing admin details, generate fallback names
    creatorIds.forEach(creatorId => {
      if (!adminDetailsMap[creatorId]) {
        const fallbackName = generateInstructorName(creatorId);
        adminDetailsMap[creatorId] = {
          firstName: fallbackName.split(' ')[0],
          lastName: fallbackName.split(' ')[1] || '',
          fullName: fallbackName
        };
      }
    });

    setAdminDetails(adminDetailsMap);
  };

  const generateInstructorName = (creatorId) => {
    const instructorNames = [
      'Dr. Rajesh Kumar', 'Prof. Priya Sharma', 'Amit Patel', 'Sneha Gupta',
      'Vikram Singh', 'Anita Verma', 'Rohit Mehta', 'Kavya Reddy',
      'Arjun Nair', 'Meera Joshi', 'Sanjay Agarwal', 'Ritika Bansal'
    ];
    
    const hash = creatorId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return instructorNames[Math.abs(hash) % instructorNames.length];
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const handleCourseClick = (course) => {
    if (!token) {
      showToast('Please login to access course details', 'info');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (role === 'admin') {
      navigate('/admin/admindashboard');
    } else {
      navigate('/user/userdashboard');
    }
  };

  const handleQuickPurchase = async (e, courseId) => {
    e.stopPropagation();
    
    if (!token) {
      showToast('Please login to purchase courses', 'info');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (role !== 'user') {
      showToast('Only students can purchase courses', 'error');
      return;
    }

    try {
      await axios.post(API_ENDPOINTS.COURSE_PURCHASE, 
        { courseId },
        { headers: { Authorization: token } }
      );
      showToast('Course purchased successfully!', 'success');
      setTimeout(() => navigate('/user/userdashboard'), 2000);
    } catch (error) {
      showToast('Purchase failed. Please try again.', 'error');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Hero Section */}
      <div className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-600 to-purple-700'} text-white`}>
        <div className="container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Learn Without Limits
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Start, switch, or advance your career with thousands of courses from world-class instructors
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-lg">
              <div className="bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                {courses.length}+ Courses
              </div>
              <div className="bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                Expert Instructors
              </div>
              <div className="bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                Lifetime Access
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="What do you want to learn?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value || '')}
              className={`w-full px-6 py-4 text-lg rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } shadow-lg`}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCourses.map((course) => {
            const creatorDetails = adminDetails[course.creatorId];
            const creatorName = creatorDetails ? creatorDetails.fullName : 'Instructor';
            const creatorInitial = creatorName.charAt(0);
            const thumbnailUrl = getYouTubeThumbnail(course.imageUrl);
            
            return (
              <div 
                key={course._id} 
                className={`group cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-2xl overflow-hidden shadow-lg`}
                onClick={() => handleCourseClick(course)}
              >
                {/* Course Thumbnail */}
                <div className="relative overflow-hidden h-48">
                  <img 
                    src={thumbnailUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/400/225';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full font-bold text-sm shadow-lg">
                    ₹{course.price?.toLocaleString()}
                  </div>
                  
                  {/* YouTube Play Indicator */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 text-gray-800 px-4 py-2 rounded-full font-medium flex items-center">
                      <svg className="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      View Course
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Course Title */}
                  <h3 className={`text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {course.title}
                  </h3>
                  
                  {/* Course Description */}
                  <p className={`mb-4 line-clamp-3 text-sm leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {course.description}
                  </p>
                  
                  {/* Instructor Info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {creatorInitial}
                        </span>
                      </div>
                      <div>
                        <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {creatorName}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Course Instructor
                        </div>
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center text-yellow-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                      <span className="ml-1 text-sm font-medium">4.8</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={(e) => handleQuickPurchase(e, course._id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Courses Found */}
        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className={`max-w-md mx-auto p-8 rounded-2xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {searchTerm ? 'No courses found' : 'No courses available'}
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm ? 'Try searching with different keywords' : 'Check back soon for new courses'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
