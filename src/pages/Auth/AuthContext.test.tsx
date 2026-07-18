import { render, screen, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from './AuthContext';
import { useContext } from 'react';

// Helper component to consume and display auth context values
function AuthConsumer() {
    const context = useContext(AuthContext);
    if (!context) return <div>No context</div>;
    return (
        <div>
            <span data-testid="token">{context.token ?? 'null'}</span>
            <span data-testid="user">{context.user ? JSON.stringify(context.user) : 'null'}</span>
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
});

describe('AuthContext', () => {
    it('provides null values by default when localStorage is empty', () => {
        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );
        expect(screen.getByTestId('token')).toHaveTextContent('null');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('sets user, token, and refreshToken on login', () => {
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

    it('clears user, token, and refreshToken on logout', () => {
        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        act(() => {
            screen.getByText('Login').click();
        });
        expect(screen.getByTestId('token')).toHaveTextContent('test-token');

        act(() => {
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

    it('clears localStorage on logout', () => {
        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        );

        act(() => {
            screen.getByText('Login').click();
        });
        act(() => {
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
