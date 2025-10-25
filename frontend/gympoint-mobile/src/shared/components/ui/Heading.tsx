import { useTheme } from '@shared/hooks';
import React from 'react';
import { Text } from 'react-native';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';
type HeadingAlign = 'left' | 'center' | 'right';
type HeadingColor = 'default' | 'accent';

interface HeadingProps {
  children: React.ReactNode;
  level?: HeadingLevel;
  align?: HeadingAlign;
  color?: HeadingColor;
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 'h1',
  align = 'left',
  color = 'default',
  className = '',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const levelClasses = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-semibold',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const colorClasses = {
    default: isDark ? 'text-text-dark' : 'text-text',
    accent: 'text-primary',
  };

  const headingClasses = `
    ${levelClasses[level]}
    ${alignClasses[align]}
    ${colorClasses[color]}
    ${className}
  `.trim();

  return <Text className={headingClasses}>{children}</Text>;
};

export const H1: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level="h1" {...props} />
);

export const H2: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level="h2" {...props} />
);

export const H3: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level="h3" {...props} />
);