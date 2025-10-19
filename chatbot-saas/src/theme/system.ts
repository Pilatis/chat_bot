import { createSystem, defaultConfig } from '@chakra-ui/react';
import { textStyles } from './text-styles';

export const system = createSystem(defaultConfig, {
  theme: {
    textStyles,
    tokens: {
      colors: {
        primaryButton: { value: '#E67A10' },
        baseOrange: { value: '#E67A10' },
        lightOrange: { value: '#E685104D' },
        grayTooltip: { value: '#1F1F1F' },
        grayBorder: { value: '#CED4DA' },
        grayBold: { value: '#C7C7C7' },
        grayInput: { value: '#E9ECEF' },
        whiteLight: { value: '#F8F9FA' },
        defaultBlack: { value: '#000000' },
        yellowSide: { value: '#FEC613' },
        primary: {
          100: { value: '#E67A10' },
          200: { value: '#FEC613' },
          300: { value: '#F8F9FA' }
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
