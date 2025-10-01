import styled from 'styled-components/native';
import { Image } from 'react-native';

export const Logo = styled(Image)`
  width: 150px;
  height: 40px;
  resize-mode: contain;
  margin-bottom: ${({ theme }) => theme.spacing(4)}px; /* Espacio debajo del logo */
`;
