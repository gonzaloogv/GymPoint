export interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
}

export const testimonialsData: Testimonial[] = [
  {
    id: '1',
    name: 'Lucas M.',
    role: 'Usuario frecuente',
    comment: 'Me encanta cómo puedo ver todos los gimnasios cerca mío...',
    rating: 5
  },
  {
    id: '2',
    name: 'Nuria G.',
    role: 'Usuario frecuente',
    comment: 'Poder ver la rutina de otros usuarios me ayudo a perfeccionar la mia y adaptarla a mis necesidades...',
    rating: 4.5
  },
  {
    id: '3',
    name: 'Gonzalo G.',
    role: 'Usuario frecuente',
    comment: 'GymPoint me ayudo mucho a anotar mis cargas y seguir mi progreso de manera facil desde mi celular...',
    rating: 4
  },
  {
    id: '4',
    name: 'Cristian B.',
    role: 'Usuario frecuente',
    comment: 'El sistema de racha es super adictivo, me mantiene motivado para ser constante y competir con mis amigos...',
    rating: 5
  }
];