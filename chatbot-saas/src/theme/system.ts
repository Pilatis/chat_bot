import { createSystem, defaultConfig } from '@chakra-ui/react';
import { textStyles } from './text-styles';

// Contexta: gradiente primário = hsl(187 100% 42%) → hsl(199 100% 50%)
// Secundário escuro = hsl(222 47% 8%) → hsl(222 47% 5%)
const CONTEXTA_PRIMARY = '#00A8C9'; // hsl(187 100% 42%)
const CONTEXTA_PRIMARY_END = '#0099FF'; // hsl(199 100% 50%)
const CONTEXTA_HOVER = '#0088B8';
const CONTEXTA_DARK_800 = '#0D1117'; // hsl(222 47% 8%)
const CONTEXTA_DARK_900 = '#080B0F'; // hsl(222 47% 5%)

export const system = createSystem(defaultConfig, {
  theme: {
    textStyles,
    tokens: {
      colors: {
        // Contexta - primária (logo/azul)
        primaryButton: { value: CONTEXTA_PRIMARY },
        baseOrange: { value: CONTEXTA_HOVER },
        lightOrange: { value: `${CONTEXTA_PRIMARY}26` },
        grayTooltip: { value: '#1A1A1A' },
        grayBorder: { value: '#E5E7EB' },
        grayBold: { value: '#6B7280' },
        grayInput: { value: '#F3F4F6' },
        whiteLight: { value: '#FAFAFA' },
        defaultBlack: { value: '#0A0A0A' },
        yellowSide: { value: CONTEXTA_PRIMARY_END },
        primary: {
          100: { value: CONTEXTA_PRIMARY },
          200: { value: CONTEXTA_PRIMARY_END },
          300: { value: '#F3F4F6' }
        },
        // Contexta - escala primária (azul/ciano)
        contexta: {
          50: { value: '#E6FAFC' },
          100: { value: '#B3F0F7' },
          200: { value: '#80E6F2' },
          300: { value: '#4DD9ED' },
          400: { value: '#1AC9E6' },
          500: { value: CONTEXTA_PRIMARY },
          600: { value: CONTEXTA_PRIMARY_END },
          700: { value: CONTEXTA_HOVER },
          800: { value: '#006B85' },
          900: { value: '#004D61' }
        },
        // Contexta - secundário escuro (sidebar/fundos)
        contextaDark: {
          800: { value: CONTEXTA_DARK_800 },
          900: { value: CONTEXTA_DARK_900 }
        },
        gray: {
          50: { value: '#FAFAFA' },
          100: { value: '#F5F5F5' },
          200: { value: '#E5E7EB' },
          300: { value: '#D1D5DB' },
          400: { value: '#9CA3AF' },
          500: { value: '#6B7280' },
          600: { value: '#4B5563' },
          700: { value: '#374151' },
          800: { value: '#1F2937' },
          900: { value: '#111827' }
        },
        indigo: {
          50: { value: '#E6FAFC' },
          100: { value: '#B3F0F7' },
          200: { value: '#80E6F2' },
          300: { value: '#4DD9ED' },
          400: { value: '#1AC9E6' },
          500: { value: CONTEXTA_PRIMARY },
          600: { value: CONTEXTA_PRIMARY_END },
          700: { value: CONTEXTA_HOVER },
          800: { value: '#006B85' },
          900: { value: '#004D61' }
        },
        purple: {
          50: { value: '#E6FAFC' },
          100: { value: '#B3F0F7' },
          200: { value: '#80E6F2' },
          300: { value: '#4DD9ED' },
          400: { value: '#1AC9E6' },
          500: { value: CONTEXTA_PRIMARY },
          600: { value: CONTEXTA_PRIMARY_END },
          700: { value: CONTEXTA_HOVER },
          800: { value: '#006B85' },
          900: { value: '#004D61' }
        }
      },
      fontSizes: {
        h1: { value: '40px' },
        h2: { value: '32px' },
        h3: { value: '28px' },
        h4: { value: '24px' },
        h5: { value: '20px' },
        h6: { value: '16px' },
        small: { value: '14px' }
      },
      fontWeights: {
        h1: { value: '500' },
        h2: { value: '400' },
        h3: { value: '400' },
        h4: { value: '400' },
        h5: { value: '400' },
        h6: { value: '400' }
      },
      lineHeights: {
        h1: { value: '48px' },
        h2: { value: '38.4px' },
        h3: { value: '33.6px' },
        h4: { value: '28.8px' },
        h5: { value: '24px' },
        h6: { value: '19.2px' }
      }
    }
  }
});
