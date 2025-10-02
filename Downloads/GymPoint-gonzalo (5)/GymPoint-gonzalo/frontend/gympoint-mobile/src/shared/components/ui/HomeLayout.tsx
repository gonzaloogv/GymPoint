import React from 'react';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Screen } from './Screen';
import { sp } from '@shared/styles';

const Page = styled.View`
  padding: ${(p) => sp(p.theme, 2)}px;
  gap: ${(p) => sp(p.theme, 2)}px;
`;

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
};

export function HomeLayout({ children, scroll = true }: Props) {
  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const contentSpacing = React.useMemo(
    () => ({
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: tabBarHeight + bottom + 8,
      rowGap: 16,
    }),
    [bottom, tabBarHeight],
  );

  return (
    <Screen
      scroll={scroll}
      contentContainerStyle={contentSpacing}
    >
      <Page>
        {children}
      </Page>
    </Screen>
  );
}
