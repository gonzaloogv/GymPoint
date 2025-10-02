import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const ContentWrapper = styled(ScrollView)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(2)}px;
  gap: ${({ theme }) => theme.spacing(2)}px;
`;

type Props = {
  children: React.ReactNode;
  contentContainerStyle?: any;
};

export function UserProfileLayout({ children, contentContainerStyle }: Props) {
  return (
    <Container edges={['top', 'left', 'right']}>
      <ContentWrapper 
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ContentWrapper>
    </Container>
  );
}
