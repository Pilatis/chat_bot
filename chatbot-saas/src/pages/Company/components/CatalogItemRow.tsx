import React from 'react';
import { Box, HStack, Text, VStack, IconButton } from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';
import { getMacroCategoryLabel, type MacroCategory } from '@/types/company.types';

export interface CatalogItemRowProps {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category?: MacroCategory | null;
  index: number;
  /** Rótulo para fallback quando `name` estiver vazio, ex.: "Produto" ou "Serviço" */
  kindLabel: string;
  onRemove: (id: string) => void;
  isRemoveLoading: boolean;
  isRemoveDisabled: boolean;
}

export const CatalogItemRow: React.FC<CatalogItemRowProps> = ({
  id,
  name,
  description,
  price,
  category,
  index,
  kindLabel,
  onRemove,
  isRemoveLoading,
  isRemoveDisabled,
}) => (
  <Box p={4} border="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
    <HStack justify="space-between" mb={3}>
      <Text fontWeight="medium">{name || `${kindLabel} ${index + 1}`}</Text>
      <HStack gap={2}>
        <IconButton
          aria-label={`Remover ${kindLabel.toLowerCase()}`}
          size="sm"
          variant="ghost"
          color="red.500"
          _hover={{ bg: 'red.50' }}
          onClick={() => onRemove(id)}
          disabled={isRemoveDisabled}
          loading={isRemoveLoading}
        >
          <FiTrash2 />
        </IconButton>
      </HStack>
    </HStack>

    <VStack gap={3} align="stretch">
      {category && (
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
            Categoria
          </Text>
          <Text fontSize="sm" color="gray.600">
            {getMacroCategoryLabel(category)}
          </Text>
        </Box>
      )}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
          Descrição
        </Text>
        <Text fontSize="sm" color="gray.600">
          {description || 'Sem descrição'}
        </Text>
      </Box>
      {price !== null && price !== undefined && price > 0 && (
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
            Preço
          </Text>
          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
            R$ {price.toFixed(2).replace('.', ',')}
          </Text>
        </Box>
      )}
    </VStack>
  </Box>
);
