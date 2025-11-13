import { View, ScrollView, Text, ViewProps, ScrollViewProps, TextProps } from 'react-native';
import { useTheme } from '@shared/hooks';

/** Container para steps con scroll */
export const StepScrollContainer: React.FC<ScrollViewProps> = ({ children, className = '', ...props }) => {
  const { isDark } = useTheme();
  const bgColor = isDark ? '#111827' : '#FAFAFA';

  return (
    <ScrollView
      className={`flex-1 ${className}`}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: bgColor }}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

/** Container para steps sin scroll (centrado) */
export const StepCenteredContainer: React.FC<ViewProps> = ({ children, className = '', ...props }) => (
  <View className={`flex-1 p-4 items-center justify-center ${className}`} {...props}>
    {children}
  </View>
);

/** Texto placeholder para pasos en desarrollo */
export const StepPlaceholderText: React.FC<TextProps> = ({ children, className = '', ...props }) => {
  const { isDark } = useTheme();
  const textColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <Text
      className={`text-base text-center ${className}`}
      style={{ color: textColor }}
      {...props}
    >
      {children}
    </Text>
  );
};

/** Section separada dentro de un step */
export const StepSection: React.FC<ViewProps> = ({ children, className = '', ...props }) => (
  <View className={`mb-6 ${className}`} {...props}>
    {children}
  </View>
);
