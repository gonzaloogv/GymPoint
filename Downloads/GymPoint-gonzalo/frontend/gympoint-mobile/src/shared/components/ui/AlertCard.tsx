import styled from 'styled-components/native';
import { palette } from '@shared/styles';

/**
 * AlertCard - Card con variante de alerta (puede ser premium o estándar)
 * Reutilizable para mostrar mensajes importantes con borde destacado
 */
export const AlertCard = styled.View<{ $premium?: boolean }>`
  background-color: ${({ $premium }) =>
    $premium ? palette.premiumBg : palette.surfaceMuted};
  border: 1px solid
    ${({ $premium, theme }) =>
      $premium
        ? palette.premiumBorderAlt
        : (theme?.colors?.border ?? palette.neutralBorder)};
  border-radius: ${({ theme }) => theme?.radius?.md ?? 12}px;
  padding: ${({ theme }) => (theme?.spacing ? theme.spacing(2) : 16)}px;
  margin-bottom: ${({ theme }) => (theme?.spacing ? theme.spacing(2) : 16)}px;
`;
