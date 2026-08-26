import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { IAuthContextType } from "../../../utils/interfaces/IAuthContextType";
import type { IAuthUser } from "../../../utils/interfaces/IAuthUser";

const AuthContext = createContext<IAuthContextType | null>(null);

export const AuthProvider = ({children}:{children: ReactNode}) => {
    const [token, setToken] = useState<string | null>(()=> localStorage.getItem("token") || sessionStorage.getItem("token"));
    const [refreshToken, setRefreshToken] = useState<string | null>(()=> localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken"));
    const [profile, setProfile] = useState<IAuthUser | null>(()=> {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if(!storedUser) return null;
        try{
            return JSON.parse(storedUser) as IAuthUser;

        } catch (error) {
            console.error("Failed to parse stored user:", error);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("refreshToken");
            return null;

        }
    });

    const login = useCallback((profile: IAuthUser, token: string, refreshToken: string, isPersistent: boolean = true) => {
        const storage = isPersistent ? localStorage : sessionStorage;
        setProfile(profile);
        setToken(token);
        setRefreshToken(refreshToken);
        storage.setItem("user", JSON.stringify(profile));
        storage.setItem("token", token);
        storage.setItem("refreshToken", refreshToken);
    }, []);

    const logout = useCallback(() => {
        setProfile(null);
        setToken(null);
        setRefreshToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
    }, []);

    useEffect(() => {
        if (token && !profile) {
            logout();
        }
    }, [token, profile, logout]);

return <AuthContext.Provider value={{ profile, token, refreshToken, login, logout }}>
    {children}
</AuthContext.Provider>
}



export { AuthContext};