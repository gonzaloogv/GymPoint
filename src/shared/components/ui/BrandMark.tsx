import styled from 'styled-components/native';
import { ImageSourcePropType, ViewProps } from 'react-native';
import { rad, sp } from '@shared/styles/uiTokens';

const Wrap = styled.View`
  width: 64px; height: 64px;
  border-radius: ${p => rad(p.theme, 'md', 16)}px;
  align-items: center; justify-content: center;
  margin-bottom: ${p => sp(p.theme, 2)}px;
  background-color: ${p => p.theme?.colors?.primary ?? '#111827'};
`;
const Icon = styled.Image`
  width: 36px; height: 36px;
`;

type Props = ViewProps & {
  icon: ImageSourcePropType;
  tintColor?: string;
};
export function BrandMark({ icon, tintColor = '#fff', ...rest }: Props) {
  return (
    <Wrap {...rest}>
      <Icon source={icon} tintColor={tintColor} />
    </Wrap>
  );
}
