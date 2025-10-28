import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import { MapProvider, ThemeProvider } from './context';

export const AppProviders = () => {
    return (

        <BrowserRouter>
            <ThemeProvider>
                <MapProvider>
                    <App />
                </MapProvider>
            </ThemeProvider>
        </BrowserRouter>
    )
};