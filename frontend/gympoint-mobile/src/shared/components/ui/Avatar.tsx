import styled from 'styled-components/native';
import { Circle } from './Circle';
import { palette } from '@shared/styles';

const AvatarContainer = styled(Circle)`
  background-color: ${({ theme }) => theme?.colors?.bg ?? palette.surfaceMuted};
  border-width: 1px;
  border-color: ${({ theme }) => theme?.colors?.border ?? palette.neutralBorder};
`;

const Initials = styled.Text`
  font-weight: 700;
  color: ${palette.textStrong};
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
