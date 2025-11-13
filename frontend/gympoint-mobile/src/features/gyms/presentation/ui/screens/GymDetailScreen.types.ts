export interface GymDetailScreenProps {
  gym: {
    id: number; // Changed from string to number for consistency
    name: string;
    distance: number;
    services: string[];
    hours: string;
    rating?: number;
    address: string;
    city: string; // Added city field
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
