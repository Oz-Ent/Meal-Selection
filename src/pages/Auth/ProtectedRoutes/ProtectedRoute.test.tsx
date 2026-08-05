import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthContext } from '../AuthContext/AuthContext';
import type { IAuthContextType } from '../../../utils/interfaces/IAuthContextType';

describe('ProtectedRoute Component', () => {
    it('renders children when user is authenticated', () => {
        const mockContext: IAuthContextType = {
            profile: null,
            token: 'valid-token',
            refreshToken: 'valid-refresh',
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
