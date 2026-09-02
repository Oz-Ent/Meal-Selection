import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthContext } from '../AuthContext/AuthContext';
import type { IAuthContextType } from '../../../utils/interfaces/IAuthContextType';

describe('ProtectedRoute Component', () => {
    it('renders loading spinner when auth is initializing', () => {
        const mockContext: IAuthContextType = {
            profile: null,
            token: null,
            refreshToken: null,
            isInitializing: true,
            login: jest.fn(),
            logout: jest.fn(),
        };

        render(
            <MemoryRouter>
                <AuthContext.Provider value={mockContext}>
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </AuthContext.Provider>
            </MemoryRouter>
        );

        expect(screen.getByText('Verifying session...')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders children when user is authenticated and not initializing', () => {
        const mockContext: IAuthContextType = {
            profile: null,
            token: 'valid-token',
            refreshToken: 'valid-refresh',
            isInitializing: false,
            login: jest.fn(),
            logout: jest.fn(),
        };

        render(
            <MemoryRouter>
                <AuthContext.Provider value={mockContext}>
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </AuthContext.Provider>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to login when user is not authenticated', () => {
        const mockContext: IAuthContextType = {
            profile: null,
            token: null,
            refreshToken: null,
            isInitializing: false,
            login: jest.fn(),
            logout: jest.fn(),
        };

        render(
            <MemoryRouter>
                <AuthContext.Provider value={mockContext}>
                    <ProtectedRoute>
                        <div>Protected Content</div>
                    </ProtectedRoute>
                </AuthContext.Provider>
            </MemoryRouter>
        );

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
});
