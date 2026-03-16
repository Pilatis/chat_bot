'use client';

import React, { useState } from 'react';
import { Box, Input, IconButton } from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface PasswordInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  size?: string;
  borderColor?: string;
  disabled?: boolean;
  bg?: string;
  borderRadius?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  placeholder = 'Senha',
  size = 'lg',
  borderColor,
  bg,
  borderRadius,
  ...rest
}) => {
  const [show, setShow] = useState(false);

  return (
    <Box position="relative" w="full">
      <Input
        {...rest}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        borderColor={borderColor}
        bg={bg}
        borderRadius={borderRadius}
        pr="3rem"
      />
      <IconButton
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        variant="ghost"
        size="sm"
        position="absolute"
        right="0.5rem"
        top="50%"
        transform="translateY(-50%)"
        zIndex={2}
        onClick={() => setShow(!show)}
        color="gray.500"
        _hover={{ color: 'gray.700' }}
      >
        {show ? <FiEyeOff /> : <FiEye />}
      </IconButton>
    </Box>
  );
};
