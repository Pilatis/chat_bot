'use client';

import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, HStack } from '@chakra-ui/react';
import { FiAlertCircle } from 'react-icons/fi';
import { Card } from '@/components/Card';
import { AddProductModal } from '@/components/company/AddProductModal';
import { AddServiceModal } from '@/components/company/AddServiceModal';
import { useCompany } from '@/hooks/useCompany';
import type { CreateProductData, CreateServiceData } from '@/types/company.types';
import { CompanyLoading } from './CompanyLoading';
import { CompanyError } from './CompanyError';
import { CompanyPageHeader } from './components/CompanyPageHeader';
import { CompanyDetailsForm } from './components/CompanyDetailsForm';
import { CompanyProductsCard } from './components/CompanyProductsCard';
import { CompanyServicesCard } from './components/CompanyServicesCard';

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
    isServiceLoading,
  } = useCompany();

  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const products = company?.products ?? [];
  const services = company?.services ?? [];
  const saving = isSaving ?? false;
  const productLoading = isProductLoading ?? false;
  const serviceLoading = isServiceLoading ?? false;
  const loadingProductsOrServices = productLoading || serviceLoading;

  const canAddProductsOrServices = !!(company?.id && company?.name?.trim());

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
      description,
      whatsappNumber,
    });
  };

  if (isLoading && !company) {
    return <CompanyLoading />;
  }

  if (error && !company && !isLoading) {
    return <CompanyError message={error} />;
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <CompanyPageHeader />

        <CompanyDetailsForm
          companyName={companyName}
          description={description}
          whatsappNumber={whatsappNumber}
          isSaving={saving}
          onCompanyNameChange={setCompanyName}
          onDescriptionChange={setDescription}
          onWhatsappNumberChange={setWhatsappNumber}
          onSave={handleSave}
        />

        <Card>
          <VStack gap={6} align="stretch">
            <Text fontSize="lg" fontWeight="semibold" color="grayBold">
              Produtos e Serviços
            </Text>

            {!canAddProductsOrServices && (
              <Box p={4} bg="orange.50" border="1px" borderColor="orange.200" borderRadius="md">
                <HStack gap={3} align="flex-start">
                  <FiAlertCircle
                    color="var(--chakra-colors-orange-500)"
                    size={20}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <Text fontSize="sm" color="orange.800">
                    Salve os <strong>Dados da Empresa</strong> acima (nome da empresa é obrigatório)
                    para poder adicionar produtos e serviços.
                  </Text>
                </HStack>
              </Box>
            )}

            <CompanyProductsCard
              products={products}
              canAddProductsOrServices={canAddProductsOrServices}
              loadingProductsOrServices={loadingProductsOrServices}
              isSaving={isSaving}
              isProductLoading={isProductLoading}
              isServiceLoading={isServiceLoading}
              onOpenAddModal={() => setIsAddProductModalOpen(true)}
              onRemoveProduct={removeProduct}
            />

            <Box h="1px" bg="gray.200" />

            <CompanyServicesCard
              services={services}
              canAddProductsOrServices={canAddProductsOrServices}
              loadingProductsOrServices={loadingProductsOrServices}
              isSaving={saving}
              isProductLoading={productLoading}
              isServiceLoading={serviceLoading}
              onOpenAddModal={() => setIsAddServiceModalOpen(true)}
              onRemoveService={removeService}
            />
          </VStack>
        </Card>
      </VStack>

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={handleAddProduct}
        isLoading={productLoading}
      />

      <AddServiceModal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        onSave={handleAddService}
        isLoading={serviceLoading}
      />
    </Box>
  );
};
