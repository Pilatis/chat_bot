import React from 'react';
import { Select, SelectRootProps, createListCollection } from '@chakra-ui/react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps extends Omit<SelectRootProps, 'children' | 'onChange' | 'onValueChange' | 'value' | 'collection'> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  width?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  size = 'md',
  width = '180px',
  disabled = false,
  ...props
}) => {
  const handleValueChange = (details: { value: string[] }) => {
    if (onChange && details.value.length > 0) {
      onChange(details.value[0]);
    }
  };

  const collection = React.useMemo(() => {
    return createListCollection({
      items: options.map(opt => ({ value: opt.value, label: opt.label }))
    });
  }, [options]);

  return (
    <Select.Root
      collection={collection}
      value={value ? [value] : []}
      onValueChange={handleValueChange}
      disabled={disabled}
      size={size}
      {...props}
    >
      <Select.HiddenSelect />
      
      <Select.Control
        w={width}
        bg="white"
        border="1px"
        borderColor="grayBorder"
        borderRadius="md"
        _hover={{
          borderColor: 'gray.400',
        }}
        _focus={{
          borderColor: 'contexta.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-contexta-500)',
        }}
        _disabled={{
          opacity: 0.6,
          cursor: 'not-allowed',
        }}
      >
        <Select.Trigger
          px={size === 'sm' ? 3 : size === 'md' ? 4 : 5}
          py={size === 'sm' ? 1.5 : size === 'md' ? 2 : 2.5}
        >
          <Select.ValueText
            placeholder={placeholder}
            color="defaultBlack"
            fontWeight="medium"
            fontSize={size === 'sm' ? '14px' : size === 'md' ? '14px' : '16px'}
          />
        </Select.Trigger>
        
        <Select.IndicatorGroup>
          <Select.Indicator color="grayBold" />
        </Select.IndicatorGroup>
      </Select.Control>

      <Select.Positioner>
        <Select.Content
          bg="white"
          border="1px"
          borderColor="grayBorder"
          borderRadius="md"
          shadow="lg"
          maxH="200px"
          overflowY="auto"
        >
          {options.map((option) => {
            const item = collection.items.find(item => item.value === option.value);
            return (
              <Select.Item
                key={option.value}
                item={item}
                px={size === 'sm' ? 3 : size === 'md' ? 4 : 5}
                py={size === 'sm' ? 1.5 : size === 'md' ? 2 : 2.5}
                _highlighted={{
                  bg: 'contexta.50',
                  color: 'contexta.600',
                }}
                _selected={{
                  bg: 'contexta.50',
                  color: 'contexta.600',
                  fontWeight: 'semibold',
                }}
                _hover={{
                  bg: 'gray.50',
                }}
                fontSize={size === 'sm' ? '14px' : size === 'md' ? '14px' : '16px'}
              >
                {option.label}
              </Select.Item>
            );
          })}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
};
