import React from 'react';
import { Image, ImageSourcePropType, ImageProps } from 'react-native';

interface LogoProps extends Omit<ImageProps, 'source'> {
  source: ImageSourcePropType;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  source,
  size = 'md',
  style,
  ...rest
}) => {
  const sizes = {
    sm: { width: 100, height: 27 },
    md: { width: 150, height: 40 },
    lg: { width: 200, height: 53 },
  };

  return (
    <Image
      source={source}
      style={[sizes[size], { resizeMode: 'contain' }, style]}
      {...rest}
    />
  );
};