import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeProvider";

export const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <label className="theme-switcher" htmlFor="theme-toggle">
            <input
                id="theme-toggle"
                type="checkbox"
                onChange={toggleTheme}
                checked={theme === 'dark'}
            />
            <span className="slider"></span>
        </label>
    );
};