import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@features/auth/domain/entities/User';
import { 
  HeaderWrapper, 
  HeaderTitle, 
  HeaderSubtitle, 
  TokenDisplay, 
  TokenWrapper, 
  TokenText, 
  TokenLabel 
} from '../styles/layout';

type RewardsHeaderProps = {
  user: User;
};

export const RewardsHeader: React.FC<RewardsHeaderProps> = ({ user }) => {
  return (
    <HeaderWrapper>
      <View>
        <HeaderTitle>Recompensas</HeaderTitle>
        <HeaderSubtitle>Canjeá tus tokens por beneficios</HeaderSubtitle>
      </View>
      <TokenDisplay>
        <TokenWrapper>
          <Ionicons name="flash" size={18} color="#facc15" />
          <TokenText>{user.tokens}</TokenText>
        </TokenWrapper>
        <TokenLabel>tokens disponibles</TokenLabel>
      </TokenDisplay>
    </HeaderWrapper>
  );
};
