import React from 'react';
import { Text, TextProps } from '@chakra-ui/react';
import '../index.css';

export type ContextaLogoSize = 'sm' | 'md' | 'lg' | 'xl';
export type ContextaLogoVariant = 'gradient' | 'solid';

export interface ContextaLogoProps extends Omit<TextProps, 'size'> {
  /** Tamanho da logo: sm (sidebar/navbar), md (padrão), lg (login/register) */
  size?: ContextaLogoSize;
  /** gradient = texto com gradiente da marca; solid = cor sólida (ex.: sidebar escuro) */
  variant?: ContextaLogoVariant;
  /** Centralizar horizontalmente */
  centered?: boolean;
}

const sizeMap = {
  sm: { fontSize: 'h6', fontWeight: '600' as const },
  md: { fontSize: 'h4', fontWeight: '600' as const },
  lg: { fontSize: 'h2', fontWeight: '600' as const },
  xl: { fontSize: 'h1', fontWeight: '700' as const }
};

export const ContextaLogo: React.FC<ContextaLogoProps> = ({
  size = 'md',
  variant = 'gradient',
  centered = true,
  ...rest
}) => {
  const sizeStyles = sizeMap[size];

  return (
    <Text {...sizeStyles} className="gradient-text">
      Contexta
    </Text>
  );
};
