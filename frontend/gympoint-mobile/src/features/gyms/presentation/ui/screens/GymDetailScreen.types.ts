export interface GymDetailScreenProps {
  gym: {
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
      items: {
        name: string;
        quantity: number;
      }[];
    }[];
  };
  onBack: () => void;
  onCheckIn: () => void;
}
