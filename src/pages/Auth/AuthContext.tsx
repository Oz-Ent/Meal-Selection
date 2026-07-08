import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { IAuthContextType } from "../../utils/interfaces/IAuthContextType";
import type { IAuthUser } from "../../utils/interfaces/IAuthUser";

const AuthContext = createContext<IAuthContextType | null>(null);

export const AuthProvider = ({children}:{children: ReactNode}) => {
    const [token, setToken] = useState<string | null>(()=> localStorage.getItem("token"));
    const [refreshToken, setRefreshToken] = useState<string | null>(()=> localStorage.getItem("refreshToken"));
    const [user, setUser] = useState<IAuthUser | null>(()=> {
        const storedUser = localStorage.getItem("user");
        if(!storedUser) return null;
        try{
            return JSON.parse(storedUser) as IAuthUser;

        } catch (error) {
            console.error("Failed to parse stored user:", error);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            return null;

        }
    });

    const login = useCallback((user: IAuthUser, token: string, refreshToken: string) => {
        setUser(user);
        setToken(token);
        setRefreshToken(refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        localStorage.setItem("refreshTokenn", refreshToken);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
    }, []);

    useEffect(() => {
        if (token && !user) {
            queueMicrotask(logout);
        }
    }
, [token, refreshToken, user, logout]);

return <AuthContext.Provider value={{ user, token, refreshToken, login, logout }}>
    {children}
</AuthContext.Provider>
}



export { AuthContext};