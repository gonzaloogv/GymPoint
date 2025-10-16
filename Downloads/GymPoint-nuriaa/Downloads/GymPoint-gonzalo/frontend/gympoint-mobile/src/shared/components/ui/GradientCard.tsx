import styled from 'styled-components/native';
import { palette } from '@shared/styles';

/**
 * GradientCard - Card con estilo premium (fondo y borde premium)
 * Reutilizable en cualquier feature que necesite mostrar contenido premium
 */
export const GradientCard = styled.View`
  background-color: ${palette.premiumBg};
  border: 1px solid ${palette.premiumBorderAlt};
  border-radius: ${({ theme }) => theme?.radius?.md ?? 12}px;
  padding: ${({ theme }) => (theme?.spacing ? theme.spacing(2) : 16)}px;
  margin-bottom: ${({ theme }) => (theme?.spacing ? theme.spacing(2) : 16)}px;
`;
