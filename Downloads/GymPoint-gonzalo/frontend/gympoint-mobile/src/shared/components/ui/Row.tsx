import styled from 'styled-components/native';

type RowProps = {
  $align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  $justify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
};

export const Row = styled.View<RowProps>`
  flex-direction: row;
  align-items: ${({ $align = 'center' }) => $align};
  justify-content: ${({ $justify = 'flex-start' }) => $justify};
`;
