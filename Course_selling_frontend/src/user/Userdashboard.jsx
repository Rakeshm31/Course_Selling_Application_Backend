// src/user/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';
import { API_ENDPOINTS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import VideoPlayer from '../components/VideoPlayer';

function UserDashboard() {
  const [name, setName] = useState({ first: '', last: '' });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('purchased');
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState({});
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { isDarkMode } = useTheme();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const firstName = localStorage.getItem('firstName') || '';
    const lastName = localStorage.getItem('lastName') || '';
    setName({ first: firstName, last: lastName });
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [availableRes, purchasedRes] = await Promise.all([
        axios.get(API_ENDPOINTS.COURSE_PREVIEW),
        axios.get(API_ENDPOINTS.USER_PURCHASES, {
          headers: { Authorization: token },
        })
      ]);
      
      setAvailableCourses(availableRes.data.courses || []);
      setPurchasedCourses(purchasedRes.data.courseData || []);
    } catch (err) {
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const handlePurchase = async (courseId, courseTitle) => {
    setPurchaseLoading(prev => ({ ...prev, [courseId]: true }));
    
    try {
      await axios.post(API_ENDPOINTS.COURSE_PURCHASE, 
        { courseId },
        { headers: { Authorization: token } }
      );
      
      showToast(`Successfully purchased "${courseTitle}"!`, 'success');
      await fetchCourses(); // Refresh courses
      
    } catch (error) {
      showToast('Purchase failed. Please try again.', 'error');
    } finally {
      setPurchaseLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleStartCourse = (course) => {
    setSelectedVideo({
      url: course.imageUrl || '',
      title: course.title || 'Course Video'
    });
  };

  const filteredAvailableCourses = availableCourses.filter((course) =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !purchasedCourses.some(purchased => purchased._id === course._id)
  );

  const filteredPurchasedCourses = purchasedCourses.filter((course) =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // In UserDashboard.jsx, update the CourseCard component:

const CourseCard = ({ course, isPurchased = false, onPurchase, onStartCourse }) => {
  // Extract YouTube video ID and generate thumbnail
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYouTubeThumbnail = (videoUrl) => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return '/api/placeholder/400/225';
  };

  const thumbnailUrl = getYouTubeThumbnail(course.imageUrl);

  return (
    <div className={`group rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border overflow-hidden`}>
      <div className="relative overflow-hidden h-48">
        <img 
          src={thumbnailUrl} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/225';
          }}
        />
        
        {/* YouTube Play Indicator */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-red-600 rounded-full p-3">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        
        {isPurchased && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-2 rounded-full font-semibold text-sm shadow-lg">
            Enrolled
          </div>
        )}
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-2 rounded-full font-bold backdrop-blur-sm">
          ₹{course.price?.toLocaleString()}
        </div>
      </div>
      
      {/* Rest of CourseCard remains the same */}
      <div className="p-6">
        <h3 className={`text-xl font-bold mb-3 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {course.title}
        </h3>
        <p className={`mb-4 line-clamp-3 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {course.description}
        </p>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {course.creatorId?.firstName?.charAt(0) || 'I'}
              </span>
            </div>
            <div>
              <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {course.creatorId?.firstName || 'Instructor'} {course.creatorId?.lastName || ''}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Course Instructor
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-yellow-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
            </svg>
            <span className="ml-1 text-sm font-medium">4.8</span>
          </div>
        </div>

        {isPurchased ? (
          <button
            onClick={() => onStartCourse(course)}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg"
          >
            Start Course
          </button>
        ) : (
          <button
            onClick={() => onPurchase(course._id, course.title)}
            disabled={purchaseLoading[course._id]}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
          >
            {purchaseLoading[course._id] ? (
              <>
                <LoadingSpinner size="small" color="white" />
                <span className="ml-2">Processing...</span>
              </>
            ) : (
              'Purchase Course'
            )}
          </button>
        )}
      </div>
    </div>
  );
};


  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading your dashboard...
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

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Header Section */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome back, {name.first}!
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Continue your learning journey
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex space-x-6 mt-6 md:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{purchasedCourses.length}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{availableCourses.length}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search and Tabs */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            {/* Tabs */}
            <div className={`flex rounded-xl p-1 mb-4 md:mb-0 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {[
                { key: 'purchased', label: 'My Courses', count: purchasedCourses.length },
                { key: 'available', label: 'Explore', count: filteredAvailableCourses.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 rounded-lg transition-all duration-300 font-semibold ${
                    activeTab === tab.key
                      ? isDarkMode
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-blue-600 shadow-lg'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value || '')}
                className={`w-full px-4 py-3 pl-12 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                    : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } shadow-lg`}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === 'purchased' ? (
            filteredPurchasedCourses.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className={`max-w-md mx-auto p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {searchTerm ? 'No courses found' : 'No courses enrolled yet'}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchTerm ? 'Try different search terms' : 'Explore and enroll in courses to start learning'}
                  </p>
                </div>
              </div>
            ) : (
              filteredPurchasedCourses.map((course) => (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                  isPurchased={true}
                  onStartCourse={handleStartCourse}
                />
              ))
            )
          ) : (
            filteredAvailableCourses.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className={`max-w-md mx-auto p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {searchTerm ? 'No courses found' : 'All courses purchased!'}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchTerm ? 'Try different search terms' : 'You have enrolled in all available courses'}
                  </p>
                </div>
              </div>
            ) : (
              filteredAvailableCourses.map((course) => (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                  onPurchase={handlePurchase}
                />
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
