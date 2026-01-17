import React, { useEffect } from 'react';
import { Box, VStack, Text, Spinner } from '@chakra-ui/react';
import { FiLoader } from 'react-icons/fi';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = 'Carregando...', 
  fullScreen = true 
}) => {
  // Adiciona os keyframes ao documento se ainda não existirem
  useEffect(() => {
    const styleId = 'loading-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes loading-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loading-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const containerStyles = fullScreen
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        bg: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 12,
      };

  return (
    <Box {...containerStyles}>
      <VStack gap={6} align="center">
        {/* Ícone animado com rotação e pulso */}
        <Box
          position="relative"
          style={{
            animation: 'loading-pulse 2s ease-in-out infinite',
          }}
        >
          <Box
            as={FiLoader}
            width={12}
            height={12}
            color="primaryButton"
            style={{
              animation: 'loading-spin 2s linear infinite',
              display: 'block',
            }}
          />
        </Box>

        {/* Texto de carregamento */}
        <VStack gap={2} align="center">
          <Text
            fontSize="lg"
            fontWeight="medium"
            color="gray.700"
            letterSpacing="0.5px"
          >
            {message}
          </Text>
          <Text
            fontSize="sm"
            color="gray.500"
            fontStyle="italic"
          >
            Por favor, aguarde...
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

