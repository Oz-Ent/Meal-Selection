import { useContext } from "react";
import { ThemeContext, type ThemeContextType } from "../context/themeContext";

export const useTheme = (): ThemeContextType => {
    const theme = useContext(ThemeContext);
    
    if (!theme) {
        return {
            theme: 'light',
            setTheme: () => {},
            toggleTheme: () => {},
        };
    }

    return theme;
};