export interface FeatureContent {
  id: string;
  title: string;
  description: string;
  stat: {
    number: string;
    description: string;
  };
  mediaType: 'video' | 'image';
  mediaUrl?: string;
}

export const featuresContent: FeatureContent[] = [
  {
    id: 'search',
    title: 'Encuentra el gimnasio ideal en segundos',
    description: 'Con nuestra función de búsqueda inteligente, GymPoint te muestra los gimnasios más cercanos según tu ubicación...',
    stat: {
      number: '99%',
      description: 'de los usuarios ahorro tiempo para encontrar su primer gimnasio o uno nuevo que se adapta a sus necesidades'
    },
    mediaType: 'video',
  },
  {
    id: 'routine',
    title: 'Registra tus rutinas de forma rápida y organizada',
    description: 'Con GymPoint podés cargar tus ejercicios diarios en segundos. Guardá series, repeticiones, pesos y observaciones, y consultá tus entrenamientos anteriores desde cualquier dispositivo. Tu progreso queda registrado automáticamente para que puedas enfocarte en lo que importa: entrenar mejor cada día.',
    stat: {
      number: '47%',
      description: 'logra comprender su progreso y seguir mejorando su entrenamiento (cargas, repeticiones, resistencia)'
    },
    mediaType: 'video',
  },
  {
    id: 'progress',
    title: 'Visualizá tu evolución con datos claros',
    description: 'GymPoint transforma tus registros en estadísticas visuales fáciles de entender. Seguimiento semanal, mensual y por ejercicio. Observá cómo mejorás tu fuerza, constancia y rendimiento. Ideal para mantenerte motivado y tomar decisiones informadas sobre tu entrenamiento.',
    stat: {
      number: '52%',
      description: 'de los usuarios noto sus puntos debiles y que grupo muscular deberia mejorar'
    },
    mediaType: 'video',
  },
  {
    id: 'streak',
    title: 'Entrená con motivación y compartí tu progreso',
    description: 'Mantené tu constancia con el sistema de rachas diarias y desafíos personales. Conectate con amigos, seguí su actividad y motivense mutuamente con mensajes o reacciones. Además, al cumplir objetivos y mantener tu racha activa, podés ganar increíbles recompensas y acumular tokens que desbloquean beneficios dentro y fuera de la app. GymPoint convierte tu entrenamiento en una experiencia social, divertida y gratificante.',
    stat: {
      number: '64%',
      description: 'de los usuarios afirma divertirse mejorando su racha y compitiendo con sus amigos y colegas'
    },
    mediaType: 'video',
  }
];