import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, StyleProp, ScrollViewProps } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '@shared/hooks';

type SurfaceScreenProps = {
  children: React.ReactNode;
  /**
   * When true, wraps children in a ScrollView with consistent styling.
   */
  scroll?: boolean;
  /**
   * SafeArea edges to protect. Defaults to top/left/right to match app pattern.
   */
  edges?: Edge[];
  /**
   * Additional style applied to the outer safe area container.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Additional style applied to the inner surface view.
   */
  innerStyle?: StyleProp<ViewStyle>;
  /**
   * Tailwind/nativewind className for the inner surface view.
   */
  innerClassName?: string;
  /**
   * When scroll=true, forwarded to ScrollView.contentContainerStyle.
   * When scroll=false, applied to the immediate inner View.
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Extra props forwarded to the ScrollView when scroll=true.
   */
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
};

export const SurfaceScreen: React.FC<SurfaceScreenProps> = ({
  children,
  scroll = false,
  edges = ['top', 'left', 'right'],
  style,
  innerStyle,
  innerClassName = '',
  contentContainerStyle,
  scrollProps,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const outerBackground = isDark ? '#111827' : '#f9fafb';
  const innerClass = `${innerClassName} flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`.trim();

  return (
    <SafeAreaView
      edges={edges}
      className="flex-1"
      style={[{ backgroundColor: outerBackground }, style]}
    >
      <View className={innerClass} style={[styles.inner, innerStyle]}>
        {scroll ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={contentContainerStyle}
            {...scrollProps}
          >
            {children}
          </ScrollView>
        ) : (
          <View className="flex-1" style={contentContainerStyle}>
            {children}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inner: {
    position: 'relative',
  },
});
