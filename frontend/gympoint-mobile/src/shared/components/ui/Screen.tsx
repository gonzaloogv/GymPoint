import { useTheme } from '@shared/hooks';
import React, { useMemo } from 'react';
import { ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;

  /**
   * @deprecated Use safeAreaTop and safeAreaBottom instead for granular control
   * Controls both top and bottom safe area (legacy behavior)
   */
  padBottom?: 'safe' | 'none';

  /**
   * Controls whether to apply safe area insets at the TOP of the screen
   * Prevents content from overlapping with status bar, notch, or dynamic island
   * @default true - Most screens need top safe area protection
   */
  safeAreaTop?: boolean;

  /**
   * Controls whether to apply safe area insets at the BOTTOM of the screen
   * Prevents content from overlapping with home indicator or bottom notch
   * @default false - Most screens are inside Tab Navigator which already has safe area
   */
  safeAreaBottom?: boolean;

  contentContainerStyle?: object;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = false,
  padBottom = 'none',
  safeAreaTop,
  safeAreaBottom,
  contentContainerStyle,
  keyboardShouldPersistTaps,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-background-dark' : 'bg-background';

  /**
   * Compute which edges need safe area protection
   * Priority: padBottom (legacy) > new props (safeAreaTop/Bottom)
   */
  const edges: Edge[] = useMemo(() => {
    // Legacy behavior: if padBottom='safe' is explicitly set, use it
    if (padBottom === 'safe') {
      return ['top', 'bottom'];
    }

    // New behavior: use granular props with sensible defaults
    // (padBottom='none' falls through to use new props)
    const computedEdges: Edge[] = [];

    // Default safeAreaTop to TRUE (most screens need top protection)
    if (safeAreaTop !== false) {
      computedEdges.push('top');
    }

    // Default safeAreaBottom to FALSE (Tab Navigator handles it)
    if (safeAreaBottom === true) {
      computedEdges.push('bottom');
    }

    return computedEdges;
  }, [padBottom, safeAreaTop, safeAreaBottom]);

  const Container = scroll ? ScrollView : View;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {/*
        Always use SafeAreaView but control which edges to protect
        When edges=[], it behaves like a regular View with minimal overhead
      */}
      <SafeAreaView edges={edges} className={`flex-1 ${bgColor}`}>
        <Container
          className="flex-1"
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </Container>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};