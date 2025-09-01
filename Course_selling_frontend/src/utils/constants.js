export const API_BASE_URL = 'http://localhost:3000/api/v1';

export const API_ENDPOINTS = {
  // User endpoints
  USER_SIGNUP: `${API_BASE_URL}/user/signup`,
  USER_SIGNIN: `${API_BASE_URL}/user/signin`,
  USER_PURCHASES: `${API_BASE_URL}/user/purchases`,
  USER_VALIDATE: `${API_BASE_URL}/user/validate`,
  
  // Admin endpoints
  ADMIN_SIGNUP: `${API_BASE_URL}/admin/signup`,
  ADMIN_SIGNIN: `${API_BASE_URL}/admin/signin`,
  ADMIN_COURSES: `${API_BASE_URL}/admin/course/bulk`,
  ADMIN_VALIDATE: `${API_BASE_URL}/admin/validate`,
  ADMIN_COURSE_CREATE: `${API_BASE_URL}/admin/course`,
  ADMIN_COURSE_UPDATE: `${API_BASE_URL}/admin/course`,
  ADMIN_COURSE_DELETE: `${API_BASE_URL}/admin/course`,
  
  // Course endpoints
  COURSE_PREVIEW: `${API_BASE_URL}/course/preview`,
  COURSE_PURCHASE: `${API_BASE_URL}/course/purchase`,
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  USER_DASHBOARD: '/user/userdashboard',
  ADMIN_DASHBOARD: '/admin/admindashboard',
};
