import styled from 'styled-components/native';

const Row = styled.View`
  flex-direction: row; align-items: center; gap: 8px;
  margin-vertical: ${p => (typeof p.theme?.spacing === 'function' ? p.theme.spacing(1.5) : 12)}px;
`;
const Line = styled.View`
  flex: 1; height: 1px; background-color: ${p => p.theme?.colors?.border ?? '#e5e7eb'};
`;
const Dot = styled.Text`
  color: ${p => p.theme?.colors?.subtext ?? '#6b7280'};
`;

export function DividerWithText({ children = 'o' }: { children?: string }) {
  return (
    <Row>
      <Line /><Dot>{children}</Dot><Line />
    </Row>
  );
}
