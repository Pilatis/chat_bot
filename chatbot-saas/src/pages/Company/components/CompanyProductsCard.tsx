import React from 'react';
import { Box, HStack, Text, VStack, Button, IconButton } from '@chakra-ui/react';
import { FiPlus, FiInfo } from 'react-icons/fi';
import { EmptyState } from '@/components/ui/empty-state';
import { Tooltip } from '@/components/ui/tooltip';
import type { Product } from '@/types/company.types';
import { CatalogItemRow } from './CatalogItemRow';

export interface CompanyProductsCardProps {
  products: Product[];
  canAddProductsOrServices: boolean;
  loadingProductsOrServices: boolean;
  isSaving: boolean;
  isProductLoading: boolean;
  isServiceLoading: boolean;
  onOpenAddModal: () => void;
  onRemoveProduct: (id: string) => void;
}

export const CompanyProductsCard: React.FC<CompanyProductsCardProps> = ({
  products,
  canAddProductsOrServices,
  loadingProductsOrServices,
  isSaving,
  isProductLoading,
  isServiceLoading,
  onOpenAddModal,
  onRemoveProduct,
}) => (
  <Box
    id="tour-company-products"
    opacity={canAddProductsOrServices ? 1 : 0.7}
    pointerEvents={canAddProductsOrServices ? 'auto' : 'none'}
  >
    <HStack justify="space-between" mb={4}>
      <HStack gap={2} align="center">
        <Text fontSize="lg" fontWeight="semibold">
          Produtos
        </Text>
        <Tooltip
          content={
            <VStack align="start" gap={2} maxW="300px">
              <Text fontSize="sm" fontWeight="medium">
                Por que cadastrar produtos?
              </Text>
              <Text fontSize="xs">
                Cadastre seus produtos para a IA do assistente. Quando clientes perguntarem via
                WhatsApp, o assistente poderá responder com detalhes, preços e características.
              </Text>
            </VStack>
          }
          showArrow
        >
          <IconButton
            aria-label="Informação sobre produtos"
            size="xs"
            variant="ghost"
            color="gray.500"
            _hover={{ color: 'contexta.500', bg: 'gray.100' }}
          >
            <FiInfo />
          </IconButton>
        </Tooltip>
      </HStack>
      {!canAddProductsOrServices ? (
        <Tooltip content="Salve os dados da empresa acima para adicionar produtos" showArrow>
          <Box display="inline-block">
            <Button
              size="sm"
              bg="contexta.500"
              color="white"
              variant="outline"
              loading={isProductLoading}
              disabled
            >
              <FiPlus />
              Adicionar Produto
            </Button>
          </Box>
        </Tooltip>
      ) : (
        <Button
          onClick={onOpenAddModal}
          size="sm"
          bg="contexta.500"
          color="white"
          variant="outline"
          _hover={{ bg: 'contexta.600' }}
          loading={isProductLoading}
          disabled={loadingProductsOrServices || isSaving}
        >
          <FiPlus />
          Adicionar Produto
        </Button>
      )}
    </HStack>

    <VStack gap={4} align="stretch">
      {products.map((product, index) => (
        <CatalogItemRow
          key={product.id}
          id={product.id}
          name={product.name}
          description={product.description}
          price={product.price}
          category={product.category}
          index={index}
          kindLabel="Produto"
          onRemove={onRemoveProduct}
          isRemoveLoading={isProductLoading}
          isRemoveDisabled={loadingProductsOrServices || isSaving}
        />
      ))}

      {products.length === 0 && (
        <EmptyState
          title="Nenhum produto adicionado"
          description={
            canAddProductsOrServices
              ? 'Adicione produtos para treinar o assistente'
              : 'Salve os dados da empresa acima para desbloquear'
          }
          icon={<FiPlus size={32} color="#9ca3af" />}
        />
      )}
    </VStack>
  </Box>
);
