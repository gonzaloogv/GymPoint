import React from 'react';
import { View, Image, ImageSourcePropType, ViewProps } from 'react-native';

interface BrandMarkProps extends ViewProps {
  icon: ImageSourcePropType;
  tintColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  icon,
  tintColor = '#fff',
  size = 'md',
  style,
  ...rest
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: { width: 24, height: 24 },
    md: { width: 36, height: 36 },
    lg: { width: 48, height: 48 },
  };

  return (
    <View
      className={`${sizeClasses[size]} items-center justify-center rounded-2xl bg-primary mb-4`}
      style={style}
      {...rest}
    >
      <Image
        source={icon}
        style={[
          iconSizes[size],
          { tintColor },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};