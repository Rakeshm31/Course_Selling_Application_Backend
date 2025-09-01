// src/components/VideoPlayer.jsx
import React from 'react';
import { useTheme } from '../components/ThemeContext';

const VideoPlayer = ({ videoUrl, title, onClose }) => {
  const { isDarkMode } = useTheme();
  
  
  const isYouTube = videoUrl && (
    videoUrl.includes('youtube.com/embed') || 
    videoUrl.includes('youtu.be') ||
    videoUrl.includes('youtube.com/watch')
  );


  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    
    if (url.includes('youtube.com/embed')) {
      return url;
    }
    
    // Convert watch URL to embed
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Convert youtu.be URL to embed
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  // Show error if no video URL
  if (!videoUrl) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900/90' : 'bg-black/80'
      }`}>
        <div className={`relative w-full max-w-md mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No Video Available
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No video URL is provided for this course.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      isDarkMode ? 'bg-gray-900/90' : 'bg-black/80'
    }`}>
      <div className={`relative w-full max-w-6xl mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden shadow-2xl`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className={`text-2xl font-bold px-3 py-1 rounded hover:bg-opacity-20 transition-colors ${
              isDarkMode ? 'text-gray-300 hover:bg-white' : 'text-gray-600 hover:bg-black'
            }`}
          >
            ×
          </button>
        </div>

        {/* Video Container */}
        <div className="aspect-video bg-black">
          {isYouTube ? (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <video 
              src={videoUrl} 
              controls 
              className="w-full h-full object-contain"
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 text-center text-sm ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
          🎥 Course Video • Click the × button to close
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
