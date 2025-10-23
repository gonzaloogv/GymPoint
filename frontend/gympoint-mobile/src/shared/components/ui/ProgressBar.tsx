import { View, ViewProps, StyleSheet } from 'react-native';

type ProgressTrackProps = ViewProps & {};

export const ProgressTrack = ({ className = '', style, ...props }: ProgressTrackProps) => {
  const computedStyle = StyleSheet.flatten([
    { backgroundColor: '#DDDDDD' },
    style,
  ]);

  return (
    <View
      className={`h-2 rounded-full overflow-hidden ${className}`}
      style={computedStyle}
      {...props}
    />
  );
};

type ProgressFillProps = ViewProps & { value?: number };

export const ProgressFill = ({ value = 0, className = '', style, ...props }: ProgressFillProps) => {
  const computedStyle = StyleSheet.flatten([
    { width: `${Math.max(0, Math.min(100, value))}%` },
    style,
  ]);

  return (
    <View
      className={`h-full bg-primary ${className}`}
      style={computedStyle}
      {...props}
    />
  );
};

export const ProgressWrap = ({ className = '', style, ...props }: ViewProps) => (
  <View
    className={`px-4 mb-4 ${className}`}
    style={style}
    {...props}
  />
);
