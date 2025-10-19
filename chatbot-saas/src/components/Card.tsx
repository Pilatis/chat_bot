import React from 'react';
import {
  Box,
  BoxProps,
} from '@chakra-ui/react';

interface CardProps extends BoxProps {
  children: React.ReactNode;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  hover = false, 
  ...props 
}) => {
  return (
    <Box
      bg="white"
      border="1px"
      borderColor="grayBorder"
      borderRadius="xl"
      p={6}
      shadow="md"
      transition="all 0.2s"
      _hover={hover ? {
        shadow: 'lg',
        transform: 'translateY(-2px)',
      } : {}}
      {...props}
    >
      {children}
    </Box>
  );
};
