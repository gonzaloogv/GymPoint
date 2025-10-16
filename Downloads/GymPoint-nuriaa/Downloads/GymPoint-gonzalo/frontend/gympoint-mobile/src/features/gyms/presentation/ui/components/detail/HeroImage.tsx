import styled from 'styled-components/native';

const Image = styled.Image`
  width: 100%;
  height: 180px;
`;

export const HeroImage = () => (
  <Image
    source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' }}
    resizeMode="cover"
  />
);
