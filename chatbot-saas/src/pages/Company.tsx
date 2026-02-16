import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Button,
  IconButton
} from '@chakra-ui/react';
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';
import { Card } from '../components/Card';
import { EmptyState } from '../components/ui/empty-state';
import { AddProductModal } from '../components/company/AddProductModal';
import { AddServiceModal } from '../components/company/AddServiceModal';
import { Tooltip } from '../components/ui/tooltip';
import { useCompany } from '../hooks/useCompany';
import { useToast } from '../hooks/useToast';
import { phoneMask } from '../utils/masks';
import {
  CreateProductData,
  CreateServiceData,
  getMacroCategoryLabel
} from '../types/company.types';

export const Company: React.FC = () => {
  const {
    company,
    isLoading,
    error,
    createOrUpdateCompany,
    createProduct,
    deleteProduct,
    createService,
    deleteService,
    isSaving,
    isProductLoading,
    isServiceLoading
  } = useCompany();
  const { showSuccess, showError } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const products = company?.products ?? [];
  const services = company?.services ?? [];
  const loadingProductsOrServices = isProductLoading || isServiceLoading;

  // Só permite adicionar produtos/serviços quando a empresa tiver sido salva com nome
  const canAddProductsOrServices = !!(company?.id && company?.name?.trim());

  // Carregar dados da empresa quando o componente montar
  useEffect(() => {
    if (company) {
      setCompanyName(company.name);
      setDescription(company.description || '');
      setWhatsappNumber(company.whatsappNumber || '');
    }
  }, [company]);

  const handleAddProduct = async (productData: CreateProductData) => {
    if (!company) return;

    const result = await createProduct(productData);
    if (result === 'success') {
      setIsAddProductModalOpen(false);
    }
  };

  const removeProduct = async (id: string) => {
    await deleteProduct(id);
  };

  const handleAddService = async (serviceData: CreateServiceData) => {
    if (!company) return;

    const result = await createService(serviceData);
    if (result === 'success') {
      setIsAddServiceModalOpen(false);
    }
  };

  const removeService = async (id: string) => {
    await deleteService(id);
  };

  const handleSave = async () => {
    await createOrUpdateCompany({
      name: companyName,
      description: description,
      whatsappNumber: whatsappNumber
    });
  };

  // Loading inicial - carregando dados da empresa
  if (isLoading && !company) {
    return (
      <Box>
        <VStack gap={6} align="stretch">
          <Box>
            <Text fontSize="h2" fontWeight="h2" color="grayBold" mb={2}>
              Configurações da Empresa
            </Text>
            <Text color="grayBold">
              Configure os dados da sua empresa para treinar o assistente
            </Text>
          </Box>
          <Card>
            <VStack gap={4} align="center" py={8}>
              <Text color="gray.600">Carregando dados da empresa...</Text>
            </VStack>
          </Card>
        </VStack>
      </Box>
    );
  }

  // Erro ao carregar empresa
  if (error && !company && !isLoading) {
    return (
      <Box>
        <VStack gap={6} align="stretch">
          <Box>
            <Text fontSize="h2" fontWeight="h2" color="grayBold" mb={2}>
              Configurações da Empresa
            </Text>
            <Text color="grayBold">
              Configure os dados da sua empresa para treinar o assistente
            </Text>
          </Box>
          <Card>
            <EmptyState
              title="Erro ao carregar dados"
              description={
                error ||
                'Não foi possível carregar as informações da empresa. Tente novamente.'
              }
              icon={<FiAlertCircle size={48} color="#ef4444" />}
            />
          </Card>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Text fontSize="h2" fontWeight="h2" color="grayBold" mb={2}>
            Configurações da Empresa
          </Text>
          <Text color="grayBold">
            Configure os dados da sua empresa para treinar o assistente
          </Text>
        </Box>

        <Card>
          <VStack gap={6} align="stretch">
            <Text fontSize="lg" fontWeight="semibold" color="grayBold">
              Dados da Empresa
            </Text>
            <Box>
              <Text mb={2} fontWeight="medium">
                Nome da Empresa
              </Text>
              <Input
                placeholder="Digite o nome da sua empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                size="lg"
                disabled={isSaving}
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium">
                Descrição da Empresa
              </Text>
              <Textarea
                placeholder="Descreva sua empresa, serviços e diferenciais"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                resize="vertical"
                disabled={isSaving}
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium">
                Número do WhatsApp
              </Text>
              <Input
                placeholder="(11) 99999-9999"
                value={phoneMask(whatsappNumber)}
                onChange={(e) => setWhatsappNumber(phoneMask(e.target.value))}
                size="lg"
                disabled={isSaving}
              />
            </Box>

            <Button
              onClick={handleSave}
              bg="contexta.500"
              color="white"
              size="lg"
              _hover={{ bg: 'contexta.600' }}
              loading={isSaving}
              disabled={isSaving}
              alignSelf="flex-start"
            >
              <FiSave />
              Salvar Informações
            </Button>
          </VStack>
        </Card>

        <Card>
          <VStack gap={6} align="stretch">
            <Text fontSize="lg" fontWeight="semibold" color="grayBold">
              Produtos e Serviços
            </Text>

            {!canAddProductsOrServices && (
              <Box
                p={4}
                bg="orange.50"
                border="1px"
                borderColor="orange.200"
                borderRadius="md"
              >
                <HStack gap={3} align="flex-start">
                  <FiAlertCircle
                    color="var(--chakra-colors-orange-500)"
                    size={20}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <Text fontSize="sm" color="orange.800">
                    Salve os <strong>Dados da Empresa</strong> acima (nome da
                    empresa é obrigatório) para poder adicionar produtos e
                    serviços.
                  </Text>
                </HStack>
              </Box>
            )}

            <Box
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
                          Cadastre seus produtos para a IA do assistente. Quando
                          clientes perguntarem via WhatsApp, o assistente poderá
                          responder com detalhes, preços e características.
                        </Text>
                      </VStack>
                    }
                    showArrow
                    portalled={false}
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
                  <Tooltip
                    content="Salve os dados da empresa acima para adicionar produtos"
                    showArrow
                    portalled={false}
                  >
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
                    onClick={() => setIsAddProductModalOpen(true)}
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
                  <Box
                    key={product.id}
                    p={4}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontWeight="medium">
                        {product.name || `Produto ${index + 1}`}
                      </Text>
                      <HStack gap={2}>
                        <IconButton
                          aria-label="Remover produto"
                          size="sm"
                          variant="ghost"
                          color="red.500"
                          _hover={{ bg: 'red.50' }}
                          onClick={() => removeProduct(product.id)}
                          disabled={loadingProductsOrServices || isSaving}
                          loading={isProductLoading}
                        >
                          <FiTrash2 />
                        </IconButton>
                      </HStack>
                    </HStack>

                    <VStack gap={3} align="stretch">
                      {product.category && (
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            mb={1}
                            color="gray.700"
                          >
                            Categoria
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {getMacroCategoryLabel(product.category)}
                          </Text>
                        </Box>
                      )}
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          mb={1}
                          color="gray.700"
                        >
                          Descrição
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {product.description || 'Sem descrição'}
                        </Text>
                      </Box>
                      {product.price !== null &&
                        product.price !== undefined &&
                        product.price > 0 && (
                          <Box>
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              mb={1}
                              color="gray.700"
                            >
                              Preço
                            </Text>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              fontWeight="semibold"
                            >
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </Text>
                          </Box>
                        )}
                    </VStack>
                  </Box>
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

            <Box h="1px" bg="gray.200" />

            <Box
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
                          Cadastre seus serviços para a IA do assistente. Quando
                          clientes perguntarem via WhatsApp, o assistente poderá
                          responder com detalhes, preços e como são entregues.
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
                  <Tooltip
                    content="Salve os dados da empresa acima para adicionar serviços"
                    showArrow
                    portalled={false}
                  >
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
                    onClick={() => setIsAddServiceModalOpen(true)}
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
                  <Box
                    key={service.id}
                    p={4}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontWeight="medium">
                        {service.name || `Serviço ${index + 1}`}
                      </Text>
                      <HStack gap={2}>
                        <IconButton
                          aria-label="Remover serviço"
                          size="sm"
                          variant="ghost"
                          color="red.500"
                          _hover={{ bg: 'red.50' }}
                          onClick={() => removeService(service.id)}
                          disabled={loadingProductsOrServices || isSaving}
                          loading={isServiceLoading}
                        >
                          <FiTrash2 />
                        </IconButton>
                      </HStack>
                    </HStack>

                    <VStack gap={3} align="stretch">
                      {service.category && (
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            mb={1}
                            color="gray.700"
                          >
                            Categoria
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {getMacroCategoryLabel(service.category)}
                          </Text>
                        </Box>
                      )}
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          mb={1}
                          color="gray.700"
                        >
                          Descrição
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {service.description || 'Sem descrição'}
                        </Text>
                      </Box>
                      {service.price !== null &&
                        service.price !== undefined &&
                        service.price > 0 && (
                          <Box>
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              mb={1}
                              color="gray.700"
                            >
                              Preço
                            </Text>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              fontWeight="semibold"
                            >
                              R$ {service.price.toFixed(2).replace('.', ',')}
                            </Text>
                          </Box>
                        )}
                    </VStack>
                  </Box>
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
          </VStack>
        </Card>
      </VStack>

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={handleAddProduct}
        isLoading={isProductLoading}
      />

      <AddServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        onSave={handleAddService}
        isLoading={isServiceLoading}
      />
    </Box>
  );
};
