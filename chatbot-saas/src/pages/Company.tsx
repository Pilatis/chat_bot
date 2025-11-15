import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Button,
  IconButton,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiSave, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { Card } from '../components/Card';
import { EmptyState } from '../components/ui/empty-state';
import { AddProductModal } from '../components/company/AddProductModal';
import { Tooltip } from '../components/ui/tooltip';
import { useCompany } from '../hooks/useCompany';
import { useToast } from '../hooks/useToast';
import { useApi } from '../hooks/use-api';
import { phoneMask } from '../utils/masks';
import { CreateProductData } from '../types/company.types';
import { AITrainingAidMessage } from '../components/company/AI-training-aid-message';


export const Company: React.FC = () => {
  const { 
    company, 
    isLoading, 
    error, 
    createOrUpdateCompany, 
    createProduct, 
    deleteProduct,
    isSaving,
    isProductLoading
  } = useCompany();
  const { showSuccess, showError } = useToast();
  const { api } = useApi();
  
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isTrained, setIsTrained] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

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
    
    try {
      await createProduct(productData);
      showSuccess('Produto adicionado com sucesso!', {
        title: 'Sucesso!'
      });
    } catch (err) {
      showError(error || 'Tente novamente', {
        title: 'Erro ao adicionar produto'
      });
      throw err; // Re-throw para o modal tratar
    }
  };


  const removeProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      showSuccess('Produto removido!');
    } catch (err) {
      showError(error || 'Tente novamente', {
        title: 'Erro ao remover produto'
      });
    }
  };


  const handleSave = async () => {
    try {
      await createOrUpdateCompany({
        name: companyName,
        description: description,
        whatsappNumber: whatsappNumber,
      });
      
      showSuccess('Os dados da empresa foram atualizados com sucesso.', {
        title: 'Informações salvas!'
      });
    } catch (err) {
      showError(error || 'Tente novamente', {
        title: 'Erro ao salvar empresa'
      });
    }
  };

  const handleTrain = async () => {
    if (!company?.id) return;
    
    try {
      setIsTraining(true);
      
      // Chamar API de treinamento - isso vai coletar TODOS os produtos e fazer treinamento geral
      const response = await api.post(`/chatbot/${company.id}/train`);
      
      if (response.data?.success) {
        setIsTrained(true);
        showSuccess('IA treinada com sucesso! O chatbot agora conhece todos os seus produtos e pode responder automaticamente via WhatsApp.', {
          title: 'Treinamento concluído!'
        });
      } else {
        throw new Error(response.data?.message || 'Erro ao treinar IA');
      }
    } catch (err: any) {
      showError(err.message || 'Erro ao treinar IA. Verifique se há produtos cadastrados.', {
        title: 'Erro no treinamento'
      });
    } finally {
      setIsTraining(false);
    }
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
              Configure os dados da sua empresa para treinar o chatbot
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
              Configure os dados da sua empresa para treinar o chatbot
            </Text>
          </Box>
          <Card>
            <EmptyState
              title="Erro ao carregar dados"
              description={error || "Não foi possível carregar as informações da empresa. Tente novamente."}
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
            Configure os dados da sua empresa para treinar o chatbot
          </Text>
        </Box>

        <Card>
          <VStack gap={6} align="stretch">
            <Box>
              <Text mb={2} fontWeight="medium">Nome da Empresa</Text>
              <Input
                placeholder="Digite o nome da sua empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                size="lg"
                disabled={isSaving || isProductLoading}
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium">Descrição da Empresa</Text>
              <Textarea
                placeholder="Descreva sua empresa, serviços e diferenciais"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                resize="vertical"
                disabled={isSaving || isProductLoading}
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium">Número do WhatsApp</Text>
              <Input
                placeholder="(11) 99999-9999"
                value={phoneMask(whatsappNumber)}
                onChange={(e) => setWhatsappNumber(phoneMask(e.target.value))}
                size="lg"
                disabled={isSaving || isProductLoading}
              />
            </Box>

            <Box h="1px" bg="gray.200" />

            <Box>
              <HStack justify="space-between" mb={4}>
                <HStack gap={2} align="center">
                  <Text fontSize="lg" fontWeight="semibold">
                    Produtos/Serviços
                  </Text>
                  <Tooltip
                    content={
                      <VStack align="start" gap={2} maxW="300px">
                        <Text fontSize="sm" fontWeight="medium">
                          Por que cadastrar produtos/serviços?
                        </Text>
                        <Text fontSize="xs">
                          Ao cadastrar seus produtos e serviços aqui, a IA do chatbot será treinada com essas informações. 
                          Quando clientes perguntarem sobre seus produtos via WhatsApp, o chatbot poderá responder automaticamente 
                          com detalhes, preços e características, melhorando o atendimento e aumentando as vendas.
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
                      _hover={{ color: 'primaryButton', bg: 'gray.100' }}
                    >
                      <FiInfo />
                    </IconButton>
                  </Tooltip>
                </HStack>
                <Button
                  onClick={() => setIsAddProductModalOpen(true)}
                  size="sm"
                  bg="primaryButton"
                  color="white"
                  variant="outline"
                  _hover={{ bg: 'baseOrange' }}
                  loading={isProductLoading}
                  disabled={isProductLoading || isSaving}
                >
                  <FiPlus />
                  Adicionar Produto
                </Button>
              </HStack>

              <VStack gap={4} align="stretch">
                {company?.products?.map((product, index) => (
                  <Box
                    key={product.id}
                    p={4}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <HStack justify="space-between" mb={3}>
                      <Text fontWeight="medium">{product.name || `Produto ${index + 1}`}</Text>
                      <HStack gap={2}>
                        <IconButton
                          aria-label="Remover produto"
                          size="sm"
                          variant="ghost"
                          color="red.500"
                          _hover={{ bg: 'red.50' }}
                          onClick={() => removeProduct(product.id)}
                          disabled={isProductLoading || isSaving}
                          loading={isProductLoading}
                        >
                          <FiTrash2 />
                        </IconButton>
                      </HStack>
                    </HStack>
                    
                    <VStack gap={3} align="stretch">
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
                          Descrição
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {product.description || 'Sem descrição'}
                        </Text>
                      </Box>
                      {product.price !== null && product.price !== undefined && product.price > 0 && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
                            Preço
                          </Text>
                          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                ))}

                {(!company?.products || company.products.length === 0) && (
                  <EmptyState
                    title="Nenhum produto adicionado"
                    description="Adicione produtos ou serviços para treinar o chatbot"
                    icon={<FiPlus size={32} color="#9ca3af" />}
                  />
                )}
              </VStack>
            </Box>

            <AITrainingAidMessage />

            <HStack gap={4}>
              <Button
                onClick={handleSave}
                bg="primaryButton"
                color="white"
                size="lg"
                _hover={{ bg: 'baseOrange' }}
                loading={isSaving}
                disabled={isSaving || isProductLoading}
              >
                <FiSave />
                Salvar Informações
              </Button>
              
              <Button
                onClick={handleTrain}
                bg="green.500"
                color="white"
                size="lg"
                _hover={{ bg: 'green.600' }}
                disabled={!companyName || !description || !company?.products || company.products.length === 0 || isSaving || isProductLoading || isTraining}
                loading={isTraining}
              >
                {isTrained ? 'Retreinar IA' : 'Treinar IA'}
              </Button>
            </HStack>

            {isTrained && (
              <Box
                p={4}
                bg="green.50"
                border="1px"
                borderColor="green.200"
                borderRadius="md"
              >
                <Text color="green.700" fontWeight="medium">
                  ✅ IA treinada com sucesso! O chatbot está pronto para atender seus clientes.
                </Text>
              </Box>
            )}
          </VStack>
        </Card>
      </VStack>

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={handleAddProduct}
        isLoading={isProductLoading}
      />
    </Box>
  );
};

