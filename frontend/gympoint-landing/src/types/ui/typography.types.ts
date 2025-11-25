import type React from "react";

type H = 'h1' | 'h2' | 'h3' | 'h4';
type Align = 'left' | 'center' | 'right';

type Size = 'sm' | 'md' | 'lg';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  variant?: H;
  color?: 'default' | 'accent';
  align?: Align;
}

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  size?: Size;
  color?: 'default' | 'muted';
  align?: Align;
}