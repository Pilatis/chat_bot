import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Text,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';

export interface CustomSelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  width?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  size = 'md',
  width = '180px',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const sizeStyles = {
    sm: {
      padding: '6px 12px',
      fontSize: '14px',
      minHeight: '32px',
    },
    md: {
      padding: '8px 16px',
      fontSize: '14px',
      minHeight: '40px',
    },
    lg: {
      padding: '10px 20px',
      fontSize: '16px',
      minHeight: '48px',
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <Box position="relative" w={width} ref={selectRef}>
      <Box
        as="button"
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        w="full"
        bg="white"
        border="1px"
        borderColor={isOpen ? 'indigo.500' : 'grayBorder'}
        borderRadius="md"
        cursor={disabled ? 'not-allowed' : 'pointer'}
        opacity={disabled ? 0.6 : 1}
        transition="all 0.2s"
        _hover={disabled ? {} : {
          borderColor: 'gray.400',
        }}
        _focus={{
          outline: 'none',
          borderColor: 'indigo.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-indigo-500)',
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          ...currentSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          color={selectedOption ? 'defaultBlack' : 'grayBold'}
          fontSize={currentSize.fontSize}
          fontWeight={selectedOption ? 'medium' : 'normal'}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Box
          as={FiChevronDown}
          transition="transform 0.2s"
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
          color="grayBold"
        />
      </Box>

      {isOpen && !disabled && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={1}
          bg="white"
          border="1px"
          borderColor="grayBorder"
          borderRadius="md"
          shadow="lg"
          zIndex={1000}
          maxH="200px"
          overflowY="auto"
        >
          <VStack gap={0} align="stretch">
            {options.map((option) => (
              <Box
                key={option.value}
                as="button"
                type="button"
                w="full"
                px={currentSize.padding.split(' ')[1]}
                py={currentSize.padding.split(' ')[0]}
                textAlign="left"
                bg={value === option.value ? 'indigo.50' : 'transparent'}
                color={value === option.value ? 'indigo.600' : 'defaultBlack'}
                fontWeight={value === option.value ? 'semibold' : 'normal'}
                fontSize={currentSize.fontSize}
                cursor="pointer"
                transition="all 0.15s"
                _hover={{
                  bg: value === option.value ? 'grayInput' : 'gray.50',
                }}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

