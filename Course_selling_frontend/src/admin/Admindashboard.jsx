// src/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';
import { API_ENDPOINTS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import VideoPlayer from '../components/VideoPlayer';

function AdminDashboard() {
  const [name, setName] = useState({ first: '', last: '' });
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    imageUrl: ''  // Always initialize as empty string
  });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [errors, setErrors] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      const res = await axios.get(API_ENDPOINTS.ADMIN_COURSES, {
        headers: { Authorization: token },
      });
      setCourses(res.data.courses || []);
    } catch (err) {
      showToast('Failed to fetch courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Course title is required';
    if (!form.description.trim()) newErrors.description = 'Course description is required';
    if (!form.price || form.price <= 0) newErrors.price = 'Valid price is required';
    if (!form.imageUrl.trim()) newErrors.imageUrl = 'Video URL is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value || '' })); // Ensure no undefined values
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      await axios.post(API_ENDPOINTS.ADMIN_COURSE_CREATE, form, {
        headers: { Authorization: token },
      });
      
      setForm({ title: '', description: '', price: '', imageUrl: '' });
      setErrors({});
      showToast(`Course "${form.title}" created successfully!`, 'success');
      await fetchCourses();
      
    } catch (err) {
      showToast('Failed to create course', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    setDeleteLoading(prev => ({ ...prev, [id]: true }));
    try {
      await axios.delete(`${API_ENDPOINTS.ADMIN_COURSE_DELETE}/${id}`, {
        headers: { Authorization: token },
      });
      
      showToast(`Course "${title}" deleted successfully`, 'success');
      setCourses(prev => prev.filter(course => course._id !== id));
      
    } catch (err) {
      showToast('Failed to delete course', 'error');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handlePreviewCourse = (course) => {
    setSelectedVideo({
      url: course.imageUrl || '',
      title: course.title || 'Course Preview'
    });
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                Welcome, {name.first} {name.last}!
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage your courses and inspire students
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex space-x-6 mt-6 md:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{courses.length}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₹{courses.reduce((sum, course) => sum + (course.price || 0), 0).toLocaleString()}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Create Course Form */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl shadow-xl p-8 mb-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Create New Course
          </h2>
          
          <form onSubmit={handleAddCourse} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                  Course Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Complete React Development Course"
                  value={form.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.title 
                      ? 'border-red-500 focus:ring-red-500' 
                      : isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-white focus:ring-purple-500 focus:border-purple-500'
                        : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="2999"
                  value={form.price}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.price 
                      ? 'border-red-500 focus:ring-red-500' 
                      : isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-white focus:ring-purple-500 focus:border-purple-500'
                        : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                  }`}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Course Description
              </label>
              <textarea
                name="description"
                placeholder="Describe what students will learn in this course..."
                value={form.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.description 
                    ? 'border-red-500 focus:ring-red-500' 
                    : isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                Course Video URL (YouTube)
              </label>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://www.youtube.com/embed/VIDEO_ID"
                value={form.imageUrl}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.imageUrl 
                    ? 'border-red-500 focus:ring-red-500' 
                    : isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white focus:ring-purple-500 focus:border-purple-500'
                      : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                }`}
              />
              {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Use YouTube embed URLs like: https://www.youtube.com/embed/tPkNw4sTjUY
              </p>
            </div>

            <button 
              type="submit" 
              disabled={submitLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center"
            >
              {submitLoading ? (
                <>
                  <LoadingSpinner size="small" color="white" />
                  <span className="ml-2">Creating Course...</span>
                </>
              ) : (
                'Create Course'
              )}
            </button>
          </form>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value || '')}
              className={`w-full px-4 py-3 pl-12 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              } shadow-lg`}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <section>
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Your Courses ({filteredCourses.length})
          </h2>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className={`max-w-md mx-auto p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {searchTerm ? 'No courses found' : 'No courses created yet'}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchTerm ? 'Try different search terms' : 'Create your first course using the form above'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              

{filteredCourses.map((course) => {
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
    <div key={course._id} className={`group rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
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
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-red-600 rounded-full p-3">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full font-bold text-sm shadow-lg">
          ₹{course.price?.toLocaleString()}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className={`text-xl font-bold mb-3 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {course.title}
        </h3>
        <p className={`mb-4 line-clamp-3 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {course.description}
        </p>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => handlePreviewCourse(course)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium text-sm"
          >
            Preview
          </button>
          <button
            onClick={() => handleDelete(course._id, course.title)}
            disabled={deleteLoading[course._id]}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
          >
            {deleteLoading[course._id] ? (
              <LoadingSpinner size="small" color="white" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
})}

            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
