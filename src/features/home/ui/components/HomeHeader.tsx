import styled from 'styled-components/native';
import { View, Text, TouchableOpacity } from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';

const Row = styled.View`flex-direction: row; align-items: center;`;
const SpaceBetween = styled(Row)`justify-content: space-between;`;
const Heading = styled.Text`font-weight:700;color:${p=>p.theme?.colors?.text ?? '#111'};`;
const Subtext = styled.Text`color:${p=>p.theme?.colors?.subtext ?? '#70737A'};`;
const Avatar = styled.View`
  width:40px;height:40px;border-radius:20px;align-items:center;justify-content:center;
  background:${p=>p.theme?.colors?.bg ?? '#f7f8fb'};
  border-width:1px;border-color:${p=>p.theme?.colors?.border ?? '#e5e7eb'};
`;
const TokenPill = styled(Row)`padding:4px 8px;border-radius:10px;background-color:rgba(250,204,21,0.15);`;

type Props = {
  userName: string;
  plan: 'Free' | 'Premium';
  tokens: number;
  onBellPress?: () => void;
};

export default function HomeHeader({ userName, plan, tokens, onBellPress }: Props) {
  const initials = userName.split(' ').map(n => n[0]).join('');
  const firstName = userName.split(' ')[0];
  return (
    <SpaceBetween>
      <Row style={{ gap: 12 }}>
        <Avatar>
          <Text style={{ fontWeight: '700', color: '#111' }}>{initials}</Text>
        </Avatar>
        <View>
          <Heading>¡Hola, {firstName}!</Heading>
          <Subtext>Usuario {plan}</Subtext>
        </View>
      </Row>

      <Row style={{ gap: 8 }}>
        <TokenPill>
          <FeatherIcon name="zap" size={14} color="#a16207" />
          <Text style={{ marginLeft: 4, color: '#a16207', fontWeight: '600' }}>{tokens}</Text>
        </TokenPill>
        <TouchableOpacity
          onPress={onBellPress}
          style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <FeatherIcon name="bell" size={20} color={'#111'} />
        </TouchableOpacity>
      </Row>
    </SpaceBetween>
  );
}
