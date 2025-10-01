import type { Gym } from './services/gyms.service';

export const MOCK_UI: Gym[] = [
  { id: '1', name: 'BULLDOG CENTER', lat: -27.4546, lng: -58.9913, address: 'Av. Libertad 100', distancia: 200, services: ['Cardio','Pesas','Clases'], hours: '08:00–22:00' } as any,
  { id: '2', name: 'EQUILIBRIO FITNESS', lat: -27.4484, lng: -58.9938, address: '25 de Mayo 500', distancia: 500, services: ['Pesas','Functional'], hours: '07:00–21:00' } as any,
  { id: '3', name: 'EXEN GYM', lat: -27.4560, lng: -58.9867, address: 'Belgrano 220', distancia: 900, services: ['Cardio','Clases'], hours: '24 hs' } as any,
];
