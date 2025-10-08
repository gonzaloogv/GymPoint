import { ImageSourcePropType } from 'react-native';
import styled from 'styled-components/native';

import { BrandMark } from '@shared/components/brand';
import { H1 } from '@shared/components/ui';
import { sp } from '@shared/styles';

const Header = styled.View`
  align-items: center;
  margin-bottom: ${({ theme }) => sp(theme, 3)}px;
`;

const Subtitle = styled.Text`
  margin-top: ${({ theme }) => sp(theme, 0.75)}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.subtext};
`;

type LoginHeaderProps = {
  icon: ImageSourcePropType;
};

export function LoginHeader({ icon }: LoginHeaderProps) {
  return (
    <Header>
      <BrandMark icon={icon} />
      <H1>GymPoint</H1>
      <Subtitle>Encontrá tu gym ideal y mantené tu racha</Subtitle>
    </Header>
  );
}
