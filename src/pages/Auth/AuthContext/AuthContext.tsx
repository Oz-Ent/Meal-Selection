import { createContext, useCallback, useState, type ReactNode } from "react";
import type { IAuthContextType } from "../../../utils/interfaces/IAuthContextType";
import type { IAuthUser } from "../../../utils/interfaces/IAuthUser";
import { authStorage } from "../../../utils/misc/authStorage";

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

    const login = useCallback((profile: IAuthUser, token: string, refreshToken: string, isPersistent: boolean = true) => {
        setProfile(profile);
        setToken(token);
        setRefreshToken(refreshToken);
        authStorage.setSession(profile, token, refreshToken, isPersistent);
    }, []);

    const logout = useCallback(() => {
        setProfile(null);
        setToken(null);
        setRefreshToken(null);
        authStorage.clear();
    }, []);

return <AuthContext.Provider value={{ profile, token, refreshToken, login, logout }}>
    {children}
</AuthContext.Provider>
}



export { AuthContext};