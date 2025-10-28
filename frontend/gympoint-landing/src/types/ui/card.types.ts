import type { ReactNode } from "react";

type Size = 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'highlighted';
  padding?: Size;
}