import { Image } from 'react-native';

export const HeroImage = () => (
  <Image
    source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' }}
    resizeMode="cover"
    className="w-full h-44"
  />
);
