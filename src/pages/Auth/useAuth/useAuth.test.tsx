import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthContext } from '../AuthContext/AuthContext';
import type { IAuthContextType } from '../../../utils/interfaces/IAuthContextType';

describe('useAuth Hook', () => {
    it('throws an error when used outside AuthProvider', () => {
        // Suppress console.error for expected error
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            renderHook(() => useAuth());
        }).toThrow('useAuth must be used within an AuthProvider');

        consoleSpy.mockRestore();
    });

    it('returns the auth context when used within AuthProvider', () => {
        const mockContext: IAuthContextType = {
            profile: null,
            token: 'test-token',
            refreshToken: 'test-refresh',
            isInitializing: false,
            login: jest.fn(),
            logout: jest.fn(),
        };

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthContext.Provider value={mockContext}>
                {children}
            </AuthContext.Provider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.token).toBe('test-token');
        expect(result.current.refreshToken).toBe('test-refresh');
        expect(result.current.profile).toBeNull();
        expect(result.current.login).toBeDefined();
        expect(result.current.logout).toBeDefined();
    });
});
