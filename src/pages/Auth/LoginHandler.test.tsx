import { renderHook } from '@testing-library/react';
import { useLoginHandler } from './LoginHandler';
import { AuthContext } from './AuthContext';
import type { IAuthContextType } from '../../utils/interfaces/IAuthContextType';

// Mock the authService
jest.mock('../../api/Services/AuthServices', () => ({
    authService: {
        login: jest.fn(),
    },
}));

import { authService } from '../../api/Services/AuthServices';

const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('useLoginHandler Hook', () => {
    const mockLogin = jest.fn();
    const mockContext: IAuthContextType = {
        user: null,
        token: null,
        refreshToken: null,
        login: mockLogin,
        logout: jest.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={mockContext}>
            {children}
        </AuthContext.Provider>
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls authService.login and context login on success', async () => {
        const mockResponse = {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            user: { id: 1, email: 'test@test.com', name: 'Test', roleId: 1, roleName: 'Admin' },
            availability: { startDate: '2025-01-01', endDate: '2025-12-31' },
        };
        mockedAuthService.login.mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useLoginHandler(), { wrapper });

        const response = await result.current('test@test.com', 'password123');
        expect(mockedAuthService.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
        expect(mockLogin).toHaveBeenCalledWith(
            { user: mockResponse.user, availability: mockResponse.availability },
            'access-token',
            'refresh-token'
        );
        expect(response).toEqual(mockResponse);
    });

    it('throws UNAUTHORIZED error when errorCode is USER_INACTIVE', async () => {
        const axiosError = {
            response: {
                data: { errorCode: 'USER_INACTIVE', errorMessage: 'User is inactive' },
            },
        };
        mockedAuthService.login.mockRejectedValue(axiosError);

        const { result } = renderHook(() => useLoginHandler(), { wrapper });

        await expect(result.current('test@test.com', 'password123')).rejects.toThrow('UNAUTHORIZED');
    });

    it('throws a generic error for other error codes', async () => {
        const axiosError = {
            response: {
                data: { errorCode: 'INVALID_CREDENTIALS', errorMessage: 'Wrong password' },
            },
        };
        mockedAuthService.login.mockRejectedValue(axiosError);

        const { result } = renderHook(() => useLoginHandler(), { wrapper });

        await expect(result.current('test@test.com', 'password123')).rejects.toThrow(
            'Error Code: INVALID_CREDENTIALS, Message: Wrong password'
        );
    });
});
