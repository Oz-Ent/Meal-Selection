import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLoginHandler } from './LoginHandler';
import { AuthContext } from '../AuthContext/AuthContext';
import type { IAuthContextType } from '../../../utils/interfaces/IAuthContextType';

// Mock the authService
jest.mock('../../../api/Services/AuthServices', () => ({
  authService: {
    login: jest.fn(),
  },
}));

import { authService } from '../../../api/Services/AuthServices';

const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('useLoginHandler Hook', () => {
  const mockLogin = jest.fn();
  const mockContext: IAuthContextType = {
    profile: null,
    token: null,
    refreshToken: null,
    isInitializing: false,
    login: mockLogin,
    logout: jest.fn(),
  };

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls authService.login and context login on success with default persistent true', async () => {
    const mockResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 1, email: 'test@test.com', name: 'Test', roleId: 1, roleName: 'Admin' },
      availability: { startDate: '2025-01-01', endDate: '2025-12-31' },
    };
    mockedAuthService.login.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLoginHandler(), { wrapper });

    const response = await result.current('test@test.com', 'password123');
    expect(mockedAuthService.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
      keepSignedIn: true,
    });
    expect(mockLogin).toHaveBeenCalledWith(
      { user: mockResponse.user, availability: mockResponse.availability },
      'access-token',
      undefined,
      true,
    );
    expect(response).toEqual(mockResponse);
  });

  it('calls authService.login with keepSignedIn false when specified', async () => {
    const mockResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 1, email: 'test@test.com', name: 'Test', roleId: 1, roleName: 'Admin' },
      availability: { startDate: '2025-01-01', endDate: '2025-12-31' },
    };
    mockedAuthService.login.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLoginHandler(), { wrapper });

    const response = await result.current('test@test.com', 'password123', false);
    expect(mockedAuthService.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
      keepSignedIn: false,
    });
    expect(mockLogin).toHaveBeenCalledWith(
      { user: mockResponse.user, availability: mockResponse.availability },
      'access-token',
      undefined,
      false,
    );
    expect(response).toEqual(mockResponse);
  });

  it('propagates login errors', async () => {
    const error = new Error('Invalid credentials');

    mockedAuthService.login.mockRejectedValue(error);

    const { result } = renderHook(() => useLoginHandler(), { wrapper });

    await expect(
      result.current('test@test.com', 'password123')
  ).rejects.toThrow('Invalid credentials');
});
});
