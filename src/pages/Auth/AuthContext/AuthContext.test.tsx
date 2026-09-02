import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from './AuthContext';
import { useContext } from 'react';
import { authService } from '../../../api/Services/AuthServices';

jest.mock('../../../api/Services/AuthServices', () => ({
    authService: {
        refresh: jest.fn().mockRejectedValue(new Error('No cookie')),
        logout: jest.fn().mockResolvedValue({ message: 'Logged out' }),
    },
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

// Helper component to consume and display auth context values
function AuthConsumer() {
    const context = useContext(AuthContext);
    if (!context) return <div>No context</div>;
    return (
        <div>
            <span data-testid="token">{context.token ?? 'null'}</span>
            <span data-testid="user">{context.profile ? JSON.stringify(context.profile) : 'null'}</span>
            <span data-testid="initializing">{context.isInitializing ? 'loading' : 'ready'}</span>
            <button onClick={() => context.login(
                {
                    user: { id: 1, email: 'test@test.com', name: 'Test', roleId: 1, roleName: 'Admin' },
                    availability: { startDate: '2025-01-01', endDate: '2025-12-31' }
                },
                'test-token',
                'test-refresh-token'
            )}>Login</button>
            <button onClick={context.logout}>Logout</button>
        </div>
    );
}

beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockedAuthService.refresh.mockRejectedValue(new Error('No cookie'));
});

describe('AuthContext', () => {
    it('provides null values by default when localStorage is empty', async () => {
        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );
        expect(screen.getByTestId('token')).toHaveTextContent('null');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        await waitFor(() => {
            expect(screen.getByTestId('initializing')).toHaveTextContent('ready');
        });
    });

    it('sets user, token, and refreshToken on login', async () => {
        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        act(() => {
            screen.getByText('Login').click();
        });

        expect(screen.getByTestId('token')).toHaveTextContent('test-token');
        expect(screen.getByTestId('user')).not.toHaveTextContent('null');
    });

    it('clears user, token, and refreshToken on logout', async () => {
        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        act(() => {
            screen.getByText('Login').click();
        });
        expect(screen.getByTestId('token')).toHaveTextContent('test-token');

        await act(async () => {
            screen.getByText('Logout').click();
        });
        expect(screen.getByTestId('token')).toHaveTextContent('null');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('persists user data to localStorage on login', () => {
        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        act(() => {
            screen.getByText('Login').click();
        });

        expect(localStorage.getItem('token')).toBe('test-token');
        expect(localStorage.getItem('user')).toBeTruthy();
    });

    it('clears localStorage on logout', async () => {
        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        act(() => {
            screen.getByText('Login').click();
        });
        await act(async () => {
            screen.getByText('Logout').click();
        });

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('restores user from localStorage on mount', () => {
        const mockUser = {
            user: { id: 1, email: 'test@test.com', name: 'Test', roleId: 1, roleName: 'Admin' },
            availability: { startDate: '2025-01-01', endDate: '2025-12-31' }
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'stored-token');
        localStorage.setItem('refreshToken', 'stored-refresh');

        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
        expect(screen.getByTestId('user')).not.toHaveTextContent('null');
    });

    it('restores session from HttpOnly cookie via silent refresh', async () => {
        const cookieUser = { id: 2, email: 'cookie@test.com', name: 'Cookie User', roleId: 2, roleName: 'Employee' };
        mockedAuthService.refresh.mockResolvedValueOnce({
            accessToken: 'cookie-access-token',
            refreshToken: 'cookie-refresh-token',
            user: cookieUser,
            availability: { startDate: '2025-01-01', endDate: '2025-12-31' }
        });

        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('token')).toHaveTextContent('cookie-access-token');
            expect(screen.getByTestId('user')).toHaveTextContent('Cookie User');
            expect(screen.getByTestId('initializing')).toHaveTextContent('ready');
        });
    });

    it('handles corrupted localStorage user gracefully', () => {
        localStorage.setItem('user', 'not-valid-json');
        localStorage.setItem('token', 'some-token');

        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
});
