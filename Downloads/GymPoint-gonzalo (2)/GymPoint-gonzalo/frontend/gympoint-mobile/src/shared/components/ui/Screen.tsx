import styled from 'styled-components/native';


export const Screen = styled.SafeAreaView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
`;

export const Container = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

export const CenteredContainer = styled.View`
  flex: 1;
  justify-content: center; /* Centra el contenido verticalmente */
  align-items: center; /* Centra el contenido horizontalmente */
  padding: 0 20px; /* Agrega un padding horizontal para que los inputs no toquen los bordes */
`;
