import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { IAuthContextType } from "../../../utils/interfaces/IAuthContextType";
import type { IAuthUser } from "../../../utils/interfaces/IAuthUser";
import { authStorage } from "../../../utils/misc/authStorage";
import { authService } from "../../../api/Services/AuthServices";
import { AUTH_ERROR_EVENT } from "../../../api/axios";

const AuthContext = createContext<IAuthContextType | null>(null);

// Read and validate the persisted session once so React never has to reconcile
// an inconsistent state (e.g. a token without a parseable user) inside an effect.
const loadInitialSession = (): {
    profile: IAuthUser | null;
    token: string | null;
    refreshToken: string | null;
} => {
    const token = authStorage.getToken();
    const refreshToken = authStorage.getRefreshToken();
    const storedUser = authStorage.getRawUser();

    let profile: IAuthUser | null = null;
    if (storedUser) {
        try {
            profile = JSON.parse(storedUser) as IAuthUser;
        } catch (error) {
            console.error("Failed to parse stored user:", error);
            authStorage.clear();
            return { profile: null, token: null, refreshToken: null };
        }
    }

    if (token && !profile) {
        authStorage.clear();
        return { profile: null, token: null, refreshToken: null };
    }

    return { profile, token, refreshToken };
};

export const AuthProvider = ({children}:{children: ReactNode}) => {
    const [initialSession] = useState(loadInitialSession);
    const [token, setToken] = useState<string | null>(initialSession.token);
    const [refreshToken, setRefreshToken] = useState<string | null>(initialSession.refreshToken);
    const [profile, setProfile] = useState<IAuthUser | null>(initialSession.profile);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);

    const login = useCallback((userProfile: IAuthUser, accessToken: string, newRefreshToken?: string, isPersistent: boolean = true) => {
        setProfile(userProfile);
        setToken(accessToken);
        setRefreshToken(newRefreshToken ?? null);
        authStorage.setSession(userProfile, accessToken, newRefreshToken, isPersistent);
    }, []);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (e) {
            console.error("Server logout error:", e);
        } finally {
            setProfile(null);
            setToken(null);
            setRefreshToken(null);
            authStorage.clear();
        }
    }, []);

    // Listen for auth failures from the axios interceptor (e.g. refresh token
    // expired). The interceptor clears storage but can't update React state
    // directly, so it dispatches a DOM event that we handle here.
    useEffect(() => {
        const handleAuthError = () => {
            setProfile(null);
            setToken(null);
            setRefreshToken(null);
        };
        window.addEventListener(AUTH_ERROR_EVENT, handleAuthError);
        return () => window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const restoreSession = async () => {
            const isPersistent = authStorage.isPersistent();
            try {
                // Attempt to silently refresh session using HttpOnly cookie
                const response = await authService.refresh();
                if (isMounted && response?.accessToken) {
                    setToken(response.accessToken);
                    // Always persist the new access token to storage
                    authStorage.setTokens(response.accessToken, undefined, isPersistent);
                    if (response.user) {
                        const restoredProfile: IAuthUser = {
                            user: response.user,
                            availability: response.availability ?? { startDate: '', endDate: '' }
                        };
                        setProfile(restoredProfile);
                        authStorage.setSession(restoredProfile, response.accessToken, undefined, isPersistent);
                    }
                }
            } catch {
                // If silent refresh failed and there's no valid local session, clear storage
                if (isMounted && !authStorage.getToken()) {
                    setProfile(null);
                    setToken(null);
                    setRefreshToken(null);
                    authStorage.clear();
                }
            } finally {
                if (isMounted) {
                    setIsInitializing(false);
                }
            }
        };

        restoreSession();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <AuthContext.Provider value={{ profile, token, refreshToken, isInitializing, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };