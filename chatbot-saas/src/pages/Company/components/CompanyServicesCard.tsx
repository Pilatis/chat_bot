import React from 'react';
import { Box, HStack, Text, VStack, Button, IconButton } from '@chakra-ui/react';
import { FiPlus, FiInfo } from 'react-icons/fi';
import { EmptyState } from '@/components/ui/empty-state';
import { Tooltip } from '@/components/ui/tooltip';
import type { Service } from '@/types/company.types';
import { CatalogItemRow } from './CatalogItemRow';

export interface CompanyServicesCardProps {
  services: Service[];
  canAddProductsOrServices: boolean;
  loadingProductsOrServices: boolean;
  isSaving: boolean;
  isProductLoading: boolean;
  isServiceLoading: boolean;
  onOpenAddModal: () => void;
  onRemoveService: (id: string) => void;
}

export const CompanyServicesCard: React.FC<CompanyServicesCardProps> = ({
  services,
  canAddProductsOrServices,
  loadingProductsOrServices,
  isSaving,
  isProductLoading,
  isServiceLoading,
  onOpenAddModal,
  onRemoveService,
}) => (
  <Box
    id="tour-company-services"
    opacity={canAddProductsOrServices ? 1 : 0.7}
    pointerEvents={canAddProductsOrServices ? 'auto' : 'none'}
  >
    <HStack justify="space-between" mb={4}>
      <HStack gap={2} align="center">
        <Text fontSize="lg" fontWeight="semibold">
          Serviços
        </Text>
        <Tooltip
          content={
            <VStack align="start" gap={2} maxW="300px">
              <Text fontSize="sm" fontWeight="medium">
                Por que cadastrar serviços?
              </Text>
              <Text fontSize="xs">
                Cadastre seus serviços para a IA do assistente. Quando clientes perguntarem via
                WhatsApp, o assistente poderá responder com detalhes, preços e como são entregues.
              </Text>
            </VStack>
          }
          showArrow
          portalled={false}
        >
          <IconButton
            aria-label="Informação sobre serviços"
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
        <Tooltip content="Salve os dados da empresa acima para adicionar serviços" showArrow portalled={false}>
          <Box display="inline-block">
            <Button
              size="sm"
              bg="contexta.500"
              color="white"
              variant="outline"
              loading={isServiceLoading}
              disabled
            >
              <FiPlus />
              Adicionar Serviço
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
          loading={isServiceLoading}
          disabled={loadingProductsOrServices || isSaving}
        >
          <FiPlus />
          Adicionar Serviço
        </Button>
      )}
    </HStack>

    <VStack gap={4} align="stretch">
      {services.map((service, index) => (
        <CatalogItemRow
          key={service.id}
          id={service.id}
          name={service.name}
          description={service.description}
          price={service.price}
          category={service.category}
          index={index}
          kindLabel="Serviço"
          onRemove={onRemoveService}
          isRemoveLoading={isServiceLoading}
          isRemoveDisabled={loadingProductsOrServices || isSaving}
        />
      ))}

      {services.length === 0 && (
        <EmptyState
          title="Nenhum serviço adicionado"
          description={
            canAddProductsOrServices
              ? 'Adicione serviços para treinar o assistente'
              : 'Salve os dados da empresa acima para desbloquear'
          }
          icon={<FiPlus size={32} color="#9ca3af" />}
        />
      )}
    </VStack>
  </Box>
);
