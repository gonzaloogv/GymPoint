import { View, ViewProps } from 'react-native';

type ProgressTrackProps = ViewProps & {};

export const ProgressTrack = ({ className = '', style, ...props }: ProgressTrackProps) => (
  <View
    className={`h-2 rounded-full overflow-hidden ${className}`}
    style={{
      backgroundColor: '#DDDDDD',
      ...style,
    }}
    {...props}
  />
);

type ProgressFillProps = ViewProps & { value?: number };

export const ProgressFill = ({ value = 0, className = '', style, ...props }: ProgressFillProps) => (
  <View
    className={`h-full bg-primary ${className}`}
    style={{
      width: `${Math.max(0, Math.min(100, value))}%`,
      ...style,
    }}
    {...props}
  />
);

export const ProgressWrap = ({ className = '', style, ...props }: ViewProps) => (
  <View
    className={`px-4 mb-4 ${className}`}
    style={style}
    {...props}
  />
);
