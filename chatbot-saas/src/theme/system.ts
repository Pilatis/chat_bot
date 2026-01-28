import { createSystem, defaultConfig } from '@chakra-ui/react';
import { textStyles } from './text-styles';

export const system = createSystem(defaultConfig, {
  theme: {
    textStyles,
    tokens: {
      colors: {
        // Paleta neutra moderna - Azul suave como primária
        primaryButton: { value: '#6366F1' }, // Indigo suave
        baseOrange: { value: '#4F46E5' }, // Indigo mais escuro para hover
        lightOrange: { value: '#6366F120' }, // Indigo com transparência
        grayTooltip: { value: '#1A1A1A' }, // Preto suave
        grayBorder: { value: '#E5E7EB' }, // Cinza claro para bordas
        grayBold: { value: '#6B7280' }, // Cinza médio para textos
        grayInput: { value: '#F3F4F6' }, // Cinza muito claro para inputs
        whiteLight: { value: '#FAFAFA' }, // Branco suave para backgrounds
        defaultBlack: { value: '#0A0A0A' }, // Preto suave
        yellowSide: { value: '#8B5CF6' }, // Roxo suave como accent
        primary: {
          100: { value: '#6366F1' }, // Indigo suave
          200: { value: '#8B5CF6' }, // Roxo suave
          300: { value: '#F3F4F6' } // Cinza claro
        },
        // Tons de cinza adicionais
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
        // Tons de azul/roxo
        indigo: {
          50: { value: '#EEF2FF' },
          100: { value: '#E0E7FF' },
          200: { value: '#C7D2FE' },
          300: { value: '#A5B4FC' },
          400: { value: '#818CF8' },
          500: { value: '#6366F1' },
          600: { value: '#4F46E5' },
          700: { value: '#4338CA' },
          800: { value: '#3730A3' },
          900: { value: '#312E81' }
        },
        purple: {
          50: { value: '#FAF5FF' },
          100: { value: '#F3E8FF' },
          200: { value: '#E9D5FF' },
          300: { value: '#D8B4FE' },
          400: { value: '#C084FC' },
          500: { value: '#A855F7' },
          600: { value: '#8B5CF6' },
          700: { value: '#7C3AED' },
          800: { value: '#6D28D9' },
          900: { value: '#5B21B6' }
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
