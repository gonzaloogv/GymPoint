import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapSection.css';
import { useNearbyGyms } from '../../hooks/useNearbyGyms';
import { gymIcon, userIcon } from '../../constants/mapIcons';

export default function MapSection() {
  const { position, gyms, loading } = useNearbyGyms();
  
  console.log('USER POSITION:', position);
  console.log('GYMS:', gyms);

  return (
    <section className="map-section">
      <h2 className="map-title">Gimnasios Cercanos</h2>
      {loading && <p className="map-loading">Obteniendo ubicación del usuario...</p>}
      {!loading && position && gyms.length === 0 && <p className="map-no-results">No se encontraron gimnasios cercanos.</p>}
      {!loading && position && gyms.length > 0 && (
        <MapContainer center={position} zoom={14} scrollWheelZoom className="map-container">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} icon={userIcon}>
            <Popup>Tu ubicación</Popup>
          </Marker>
          {gyms.map(gym => (
            <Marker
              key={gym.id_gym}
              position={[gym.latitude, gym.longitude]}
              icon={gymIcon}
            >
              <Popup>{gym.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </section>
  );
}
