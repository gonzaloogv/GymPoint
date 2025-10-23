import { View, ViewProps } from 'react-native';

export const MapBox: React.FC<ViewProps> = ({ children, className = '', ...props }) => (
  <View className={`mx-4 rounded-lg overflow-hidden ${className}`} {...props}>
    {children}
  </View>
);
