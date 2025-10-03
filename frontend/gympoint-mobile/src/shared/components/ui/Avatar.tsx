import styled from 'styled-components/native';
import { Circle } from './Circle';

const AvatarContainer = styled(Circle)`
  background-color: ${({ theme }) => theme.colors.bg};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const Initials = styled.Text`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

type Props = {
  userName: string;
  size?: number;
};

export function Avatar({ userName, size = 40 }: Props) {
  const parts = userName.trim().split(/\s+/);
  const initials = parts.map((part) => part?.[0] ?? '').join('');

  return (
    <AvatarContainer $size={size}>
      <Initials>{initials}</Initials>
    </AvatarContainer>
  );
}
