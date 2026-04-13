import type { ReactNode } from 'react';

export interface CMenuItem {
  key: string;
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: CMenuItem[];
}

export interface CMenuProps {
  mode?: 'inline' | 'horizontal' | 'vertical';
  selectedKeys?: string[];
  items: CMenuItem[];
  style?: React.CSSProperties;
  className?: string;
  onSelect?: (key: string) => void;
}