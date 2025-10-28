import './App.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages';
import { RegisterGymPage } from './pages';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register-gym" element={<RegisterGymPage />} />
    </Routes>
  );
}

export default App;

