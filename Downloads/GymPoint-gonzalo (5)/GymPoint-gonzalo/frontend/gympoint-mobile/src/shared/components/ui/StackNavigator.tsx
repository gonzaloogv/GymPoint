import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

type StackScreen = {
  name: string;
  component: React.ComponentType<any>;
  options?: any;
};

type Props = {
  screens: StackScreen[];
  screenOptions?: any;
};

export function StackNavigator({ screens, screenOptions }: Props) {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {screens.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Stack.Navigator>
  );
}
