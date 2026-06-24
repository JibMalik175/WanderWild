import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from auth store
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to parse auth storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login for protected routes, not public pages
      const currentPath = window.location.pathname;
      const publicRoutes = ['/', '/explore', '/packages', '/ai-itinerary', '/chatbot'];
      const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
      
      if (!isPublicRoute) {
        // Handle unauthorized access for protected routes
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string; role: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    agencyName?: string;
  }) => api.post('/auth/register', userData),
  
  logout: () => api.post('/auth/logout'),
  
  refreshToken: () => api.post('/auth/refresh'),
  
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// Chat API
export const chatAPI = {
  getSessions: () => api.get('/chat/sessions'),
  createSession: (data: any) => api.post('/chat/sessions', data),
  getSession: (id: string) => api.get(`/chat/sessions/${id}`),
  updateSession: (id: string, data: any) => api.put(`/chat/sessions/${id}`, data),
  deleteSession: (id: string) => api.delete(`/chat/sessions/${id}`),
  getMessages: (sessionId: string) => api.get(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId: string, data: any) => api.post(`/chat/sessions/${sessionId}/messages`, data),
  sendPublicMessage: (data: any) => api.post('/chat/message', data),
  deleteMessage: (messageId: string) => api.delete(`/chat/messages/${messageId}`),
};

// Packages API
export const packagesAPI = {
  getAll: (params?: any) => api.get('/packages', { params }),
  getFeatured: () => api.get('/packages/featured'),
  getById: (id: string) => api.get(`/packages/${id}`),
  create: (data: any) => api.post('/packages', data),
  update: (id: string, data: any) => api.put(`/packages/${id}`, data),
  delete: (id: string) => api.delete(`/packages/${id}`),
  updateStatus: (id: string, data: any) => api.put(`/packages/${id}/status`, data),
  toggleFeatured: (id: string, data: any) => api.put(`/packages/${id}/featured`, data),
  getAvailability: (id: string) => api.get(`/packages/${id}/availability`),
  addAvailability: (id: string, data: any) => api.post(`/packages/${id}/availability`, data),
  getReviews: (id: string) => api.get(`/packages/${id}/reviews`),
  // Agency-specific endpoints
  getAgencyPackages: (agencyId: string, params?: any) => api.get(`/agencies/${agencyId}/packages`, { params }),
  getMyPackages: () => api.get('/packages/my'),
};

// Bookings API
export const bookingsAPI = {
  getAll: () => api.get('/bookings'),
  getMy: () => api.get('/bookings/my'),
  getById: (id: string) => api.get(`/bookings/${id}`),
  create: (data: any) => api.post('/bookings', data),
  updateStatus: (id: string, data: any) => api.put(`/bookings/${id}/status`, data),
  processPayment: (id: string, data: any) => api.post(`/bookings/${id}/payment`, data),
  getTravelers: (id: string) => api.get(`/bookings/${id}/travelers`),
  addTraveler: (id: string, data: any) => api.post(`/bookings/${id}/travelers`, data),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  updateStatus: (id: string, data: any) => api.put(`/users/${id}/status`, data),
  getStats: (id: string) => api.get(`/users/${id}/stats`),
  getBookings: (id: string) => api.get(`/users/${id}/bookings`),
  getReviews: (id: string) => api.get(`/users/${id}/reviews`),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getPublicStats: () => api.get('/analytics/public-stats'),
  getRevenue: () => api.get('/analytics/revenue'),
  getPackages: () => api.get('/analytics/packages'),
  getUsers: () => api.get('/analytics/users'),
  getAgencies: () => api.get('/analytics/agencies'),
  getUserGrowth: (params?: any) => api.get('/analytics/user-growth', { params }),
  trackEvent: (data: any) => api.post('/analytics/events', data),
};

// Agencies API
export const agenciesAPI = {
  getAll: () => api.get('/agencies'),
  getById: (id: string) => api.get(`/agencies/${id}`),
  getMe: () => api.get('/agencies/me'),
  create: (data: any) => api.post('/agencies', data),
  update: (id: string, data: any) => api.put(`/agencies/${id}`, data),
  delete: (id: string) => api.delete(`/agencies/${id}`),
  updateVerification: (id: string, data: any) => api.put(`/agencies/${id}/verification`, data),
  getPackages: (id: string) => api.get(`/agencies/${id}/packages`),
  getStats: (id: string) => api.get(`/agencies/${id}/stats`),
  getReviews: (id: string) => api.get(`/agencies/${id}/reviews`),
  getBookings: (id: string, params?: any) => api.get(`/agencies/${id}/bookings`, { params }),
  getPayments: (id: string, params?: any) => api.get(`/agencies/${id}/payments`, { params })
};

// AI Itinerary API
export const aiItineraryAPI = {
  getAll: () => api.get('/ai-itinerary'),
  getById: (id: string) => api.get(`/ai-itinerary/${id}`),
  create: (data: any) => api.post('/ai-itinerary', data),
  update: (id: string, data: any) => api.put(`/ai-itinerary/${id}`, data),
  delete: (id: string) => api.delete(`/ai-itinerary/${id}`),
  regenerate: (id: string, data: any) => api.post(`/ai-itinerary/${id}/regenerate`, data),
  share: (id: string, data: any) => api.post(`/ai-itinerary/${id}/share`, data),
  generatePublic: (data: any) => api.post('/ai-itinerary/generate', data),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  getPackages: (id: string) => api.get(`/categories/${id}/packages`),
};

// Inquiries API
export const inquiriesAPI = {
  getAll: () => api.get('/inquiries'),
  getMy: () => api.get('/inquiries/my'),
  getAgency: () => api.get('/inquiries/agency'),
  getById: (id: string) => api.get(`/inquiries/${id}`),
  create: (data: any) => api.post('/inquiries', data),
  updateStatus: (id: string, data: any) => api.put(`/inquiries/${id}/status`, data),
  getMessages: (id: string) => api.get(`/inquiries/${id}/messages`),
  sendMessage: (id: string, data: any) => api.post(`/inquiries/${id}/messages`, data),
  markMessageRead: (messageId: string) => api.put(`/inquiries/messages/${messageId}/read`),
};

// Reviews API
export const reviewsAPI = {
  getAll: (params?: any) => api.get('/reviews', { params }),
  getById: (id: string) => api.get(`/reviews/${id}`),
  create: (data: any) => api.post('/reviews', data),
  update: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
  verify: (id: string, data: any) => api.put(`/reviews/${id}/verify`, data),
  getStats: () => api.get('/reviews/stats/overview'),
  getMy: () => api.get('/reviews/my'),
};

// VR API
export const vrAPI = {
  getExperiences: (params?: any) => api.get('/vr/experiences', { params }),
  getFeaturedExperiences: () => api.get('/vr/experiences/featured'),
  getExperience: (id: string) => api.get(`/vr/experiences/${id}`),
  createExperience: (data: any) => api.post('/vr/experiences', data),
  updateExperience: (id: string, data: any) => api.put(`/vr/experiences/${id}`, data),
  deleteExperience: (id: string) => api.delete(`/vr/experiences/${id}`),
  updateExperienceStatus: (id: string, data: any) => api.put(`/vr/experiences/${id}/status`, data),
  toggleExperienceFeatured: (id: string, data: any) => api.put(`/vr/experiences/${id}/featured`, data),
  getAllBookings: () => api.get('/vr/bookings'),
  getMyBookings: () => api.get('/vr/bookings/my'),
  getBooking: (id: string) => api.get(`/vr/bookings/${id}`),
  createBooking: (data: any) => api.post('/vr/bookings', data),
  updateBookingStatus: (id: string, data: any) => api.put(`/vr/bookings/${id}/status`, data),
  getStats: () => api.get('/vr/stats'),
};

// File Upload API
export const uploadAPI = {
  uploadImage: (file: File, type: 'package' | 'profile' | 'agency') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadMultipleImages: (files: File[], type: 'package' | 'gallery') => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('type', type);
    return api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
