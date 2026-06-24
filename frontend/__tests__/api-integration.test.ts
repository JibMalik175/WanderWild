import { packagesAPI, analyticsAPI, chatAPI, aiItineraryAPI } from '../app/utils/api';

// Mock axios for testing
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Packages API', () => {
    it('should fetch featured packages', async () => {
      const mockResponse = {
        data: [
          { id: '1', name: 'Test Package', price: 100, location: 'Test Location' }
        ]
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await packagesAPI.getFeatured();
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/packages/featured');
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should fetch all packages with filters', async () => {
      const mockResponse = {
        data: [
          { id: '1', name: 'Package 1', price: 100 },
          { id: '2', name: 'Package 2', price: 200 }
        ]
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const filters = { search: 'test', minPrice: 100, maxPrice: 500 };
      const result = await packagesAPI.getAll(filters);
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/packages', { params: filters });
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should fetch package by ID', async () => {
      const mockResponse = {
        data: { id: '1', name: 'Test Package', price: 100 }
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await packagesAPI.getById('1');
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/packages/1');
      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('Analytics API', () => {
    it('should fetch overview analytics', async () => {
      const mockResponse = {
        data: {
          totalUsers: 1000,
          totalPackages: 50,
          totalRevenue: 50000
        }
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getOverview();
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/analytics/overview');
      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('Chat API', () => {
    it('should create chat session', async () => {
      const mockResponse = {
        data: { id: 'session-1', title: 'New Chat' }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const sessionData = { title: 'New Chat', description: 'Test chat' };
      const result = await chatAPI.createSession(sessionData);
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/chat/sessions', sessionData);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should send message to chat session', async () => {
      const mockResponse = {
        data: { id: 'msg-1', content: 'AI Response', role: 'ai' }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const messageData = { content: 'Hello', role: 'user' };
      const result = await chatAPI.sendMessage('session-1', messageData);
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/chat/sessions/session-1/messages', messageData);
      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('AI Itinerary API', () => {
    it('should create itinerary', async () => {
      const mockResponse = {
        data: {
          id: 'itinerary-1',
          destination: 'Bali',
          itinerary: 'Day 1: Arrival...'
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const itineraryData = {
        destination: 'Bali',
        duration_days: 7,
        budget_range: '500-1000',
        interests: ['Culture', 'Adventure']
      };
      const result = await aiItineraryAPI.create(itineraryData);
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/ai-itinerary', itineraryData);
      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const error = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(error);

      try {
        await packagesAPI.getFeatured();
      } catch (err) {
        expect(err).toBe(error);
      }
    });

    it('should handle 401 unauthorized errors', async () => {
      const error = {
        response: { status: 401 }
      };
      mockedAxios.get.mockRejectedValue(error);

      // Should trigger token removal and redirect
      try {
        await packagesAPI.getFeatured();
      } catch (err) {
        expect(err).toBe(error);
      }
    });
  });
});

