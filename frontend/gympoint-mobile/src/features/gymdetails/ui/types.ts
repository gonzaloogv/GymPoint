export interface Gym {
  id: string;
  name: string;
  distance: number;
  services: string[];
  hours: string;
  rating?: number;
  address: string;
  coordinates: [number, number];
  price?: number;
  equipment?: {
    category: string;
    icon: string;
    items: { name: string; quantity: number }[];
  }[];
}

export interface GymDetailScreenProps {
  gym: Gym;
  onBack: () => void;
  onCheckIn: () => void;
}
