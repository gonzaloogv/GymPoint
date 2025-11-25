import { useContext } from 'react';
import { ThemeContext } from '../providers';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Provide more detailed error information
    console.error(
      'useTheme hook error: ThemeContext is undefined.\n' +
      'This typically means the component using useTheme is not wrapped in a <ThemeProvider>.\n' +
      'Make sure your component tree has ThemeProvider as a parent component.'
    );
    throw new Error(
      'useTheme must be used within ThemeProvider. ' +
      'Ensure ThemeProvider wraps your component tree.'
    );
  }
  return context;
};