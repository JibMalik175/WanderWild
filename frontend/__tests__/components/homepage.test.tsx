import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '../../app/page';
import { packagesAPI, analyticsAPI } from '../../app/utils/api';

// Mock the API modules
jest.mock('../../app/utils/api');
const mockPackagesAPI = packagesAPI as jest.Mocked<typeof packagesAPI>;
const mockAnalyticsAPI = analyticsAPI as jest.Mocked<typeof analyticsAPI>;

describe('HomePage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load featured packages from API', async () => {
    const mockPackages = [
      { id: '1', name: 'Bali Adventure', price: 500, location: 'Bali, Indonesia' },
      { id: '2', name: 'Swiss Alps Tour', price: 800, location: 'Switzerland' }
    ];
    
    mockPackagesAPI.getFeatured.mockResolvedValue({ 
      data: mockPackages,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    } as any);
    mockAnalyticsAPI.getOverview.mockResolvedValue({
      data: { totalUsers: 1000, totalPackages: 50, totalAgencies: 25 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    } as any);

    render(<HomePage />);

    // Wait for API calls to complete
    await waitFor(() => {
      expect(mockPackagesAPI.getFeatured).toHaveBeenCalled();
      expect(mockAnalyticsAPI.getOverview).toHaveBeenCalled();
    });

    // Check if packages are displayed
    expect(screen.getByText('Bali Adventure')).toBeInTheDocument();
    expect(screen.getByText('Swiss Alps Tour')).toBeInTheDocument();
  });

  it('should show loading state while fetching data', async () => {
    // Mock slow API response
    mockPackagesAPI.getFeatured.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      } as any), 100))
    );
    mockAnalyticsAPI.getOverview.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      } as any), 100))
    );

    render(<HomePage />);

    // Should show loading state initially
    expect(screen.getByText('Loading package details...')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    mockPackagesAPI.getFeatured.mockRejectedValue(new Error('API Error'));
    mockAnalyticsAPI.getOverview.mockRejectedValue(new Error('API Error'));

    render(<HomePage />);

    await waitFor(() => {
      // Should fallback to default content
      expect(screen.getByText('Featured Tour Packages')).toBeInTheDocument();
    });
  });

  it('should display analytics data from API', async () => {
    const mockAnalytics = {
      totalUsers: 1500,
      totalPackages: 75,
      totalAgencies: 30,
      totalRevenue: 100000
    };
    
    mockPackagesAPI.getFeatured.mockResolvedValue({ 
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    } as any);
    mockAnalyticsAPI.getOverview.mockResolvedValue({ 
      data: mockAnalytics,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    } as any);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('1500')).toBeInTheDocument(); // Total Users
      expect(screen.getByText('75')).toBeInTheDocument(); // Total Packages
      expect(screen.getByText('30')).toBeInTheDocument(); // Total Agencies
    });
  });
});

