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
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { Card } from '../components/Card';
import { useCompany } from '../hooks/useCompany';
import { useToast } from '../hooks/useToast';


export const Company: React.FC = () => {
  const { company, isLoading, error, createOrUpdateCompany, createProduct, updateProduct, deleteProduct } = useCompany();
  const { showSuccess, showError } = useToast();
  
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isTrained, setIsTrained] = useState(false);

  // Carregar dados da empresa quando o componente montar
  useEffect(() => {
    if (company) {
      setCompanyName(company.name);
      setDescription(company.description || '');
      setWhatsappNumber(company.whatsappNumber || '');
    }
  }, [company]);

  const addProduct = async () => {
    if (!company) return;
    
    try {
      await createProduct({
        name: '',
        description: '',
        price: 0,
      });
      showSuccess('Produto adicionado!');
    } catch (err) {
      showError(error || 'Tente novamente', {
        title: 'Erro ao adicionar produto'
      });
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

  const handleUpdateProduct = async (id: string, field: 'name' | 'description' | 'price', value: string | number) => {
    try {
      const updateData: any = {};
      updateData[field] = value;
      await updateProduct(id, updateData);
    } catch (err) {
      showError(error || 'Tente novamente', {
        title: 'Erro ao atualizar produto'
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

  const handleTrain = () => {
    setIsTrained(true);
    showSuccess('O chatbot foi treinado com os dados da sua empresa.', {
      title: 'IA treinada!'
    });
  };

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
              />
            </Box>

            <Box>
              <Text mb={2} fontWeight="medium">Número do WhatsApp</Text>
              <Input
                placeholder="(11) 99999-9999"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                size="lg"
              />
            </Box>

            <Box h="1px" bg="gray.200" />

            <Box>
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Produtos/Serviços
                </Text>
                <Button
                  onClick={addProduct}
                  size="sm"
                  bg="primaryButton"
                  color="white"
                  variant="outline"
                  _hover={{ bg: 'baseOrange' }}
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
                      <Text fontWeight="medium">Produto {index + 1}</Text>
                      <IconButton
                        aria-label="Remover produto"
                        size="sm"
                        bg="red.500"
                        color="white"
                        variant="ghost"
                        _hover={{ bg: 'red.600' }}
                        onClick={() => removeProduct(product.id)}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </HStack>
                    
                    <VStack gap={3} align="stretch">
                      <Input
                        placeholder="Nome do produto"
                        value={product.name}
                        onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)}
                        size="sm"
                      />
                      <Textarea
                        placeholder="Descrição do produto"
                        value={product.description || ''}
                        onChange={(e) => handleUpdateProduct(product.id, 'description', e.target.value)}
                        rows={2}
                        size="sm"
                      />
                      <Input
                        placeholder="Preço (R$)"
                        type="number"
                        value={product.price || 0}
                        onChange={(e) => handleUpdateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                        size="sm"
                      />
                    </VStack>
                  </Box>
                ))}

                {(!company?.products || company.products.length === 0) && (
                  <Text color="gray.500" textAlign="center" py={4}>
                    Nenhum produto adicionado ainda
                  </Text>
                )}
              </VStack>
            </Box>

            <HStack gap={4}>
              <Button
                onClick={handleSave}
                bg="primaryButton"
                color="white"
                size="lg"
                _hover={{ bg: 'baseOrange' }}
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
                disabled={!companyName || !description || !company?.products || company.products.length === 0}
                loading={isLoading}
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
    </Box>
  );
};

