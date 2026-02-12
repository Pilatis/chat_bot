'use client';

import React, { useState, useEffect } from 'react';
import { CompanyContext } from '../context/company-context';
import { CompanyContextType, CreateCompanyData, CreateProductData, UpdateProductData, CreateServiceData, UpdateServiceData, Company, type ProviderResult } from '../types/company.types';
import { useApi } from '../hooks/use-api';
import { useToast } from '../hooks/useToast';

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Inicia como true para carregamento inicial
  const [isSaving, setIsSaving] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [isServiceLoading, setIsServiceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { api } = useApi();
  const { showError, showSuccess } = useToast();

  const clearError = (): void => setError(null);

  const refreshCompany = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/company');
      
      if (response.data?.success) {
        setCompany(response.data.data);
      } else {
        showError(response.data?.message || 'Erro ao carregar empresa');
        setError(response.data?.message || 'Erro ao carregar empresa');
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao carregar empresa';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrUpdateCompany = async (data: CreateCompanyData): Promise<ProviderResult> => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await api.post('/company', data);

      if (response.data?.success) {
        setCompany(response.data.data);
        showSuccess(response.data?.message || 'Empresa salva com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao salvar empresa';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao salvar empresa';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsSaving(false);
    }
  };

  const createProduct = async (data: CreateProductData): Promise<ProviderResult> => {
    if (!company) {
      setError('Empresa não encontrada');
      return;
    }

    try {
      setIsProductLoading(true);
      setError(null);

      const response = await api.post(`/company/${company.id}/products`, data);

      if (response.data?.success) {
        await refreshCompany();
        showSuccess(response.data?.message || 'Produto criado com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao criar produto';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao criar produto';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsProductLoading(false);
    }
  };

  const updateProduct = async (productId: string, data: UpdateProductData): Promise<ProviderResult> => {
    try {
      setIsProductLoading(true);
      setError(null);

      const response = await api.put(`/company/products/${productId}`, data);

      if (response.data?.success) {
        await refreshCompany();
        showSuccess(response.data?.message || 'Produto atualizado com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao atualizar produto';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao atualizar produto';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsProductLoading(false);
    }
  };

  const deleteProduct = async (productId: string): Promise<ProviderResult> => {
    try {
      setIsProductLoading(true);
      setError(null);

      const response = await api.deleted(`/company/products/${productId}`);

      if (response.data?.success) {
        await refreshCompany();
        showSuccess(response.data?.message || 'Produto removido com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao deletar produto';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao deletar produto';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsProductLoading(false);
    }
  };

  const createService = async (data: CreateServiceData): Promise<ProviderResult> => {
    if (!company) {
      setError('Empresa não encontrada');
      return;
    }

    try {
      setIsServiceLoading(true);
      setError(null);

      const response = await api.post(`/company/${company.id}/services`, data);

      if (response.data?.success) {
        await refreshCompany();
        showSuccess(response.data?.message || 'Serviço criado com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao criar serviço';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao criar serviço';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsServiceLoading(false);
    }
  };

  const updateService = async (serviceId: string, data: UpdateServiceData): Promise<ProviderResult> => {
    try {
      setIsServiceLoading(true);
      setError(null);

      const response = await api.put(`/company/services/${serviceId}`, data);

      if (response.data?.success) {
        await refreshCompany();
        showSuccess(response.data?.message || 'Serviço atualizado com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao atualizar serviço';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao atualizar serviço';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsServiceLoading(false);
    }
  };

  const deleteService = async (serviceId: string): Promise<ProviderResult> => {
    try {
      setIsServiceLoading(true);
      setError(null);

      const response = await api.deleted(`/company/services/${serviceId}`);

      if (response.data?.success) {
        await refreshCompany();
        showSuccess(response.data?.message || 'Serviço removido com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao deletar serviço';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao deletar serviço';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsServiceLoading(false);
    }
  };

  // Carregar empresa ao montar o componente
  useEffect(() => {
    refreshCompany();
  }, []);

  const contextValue: CompanyContextType = {
    company,
    isLoading,
    error,
    createOrUpdateCompany,
    createProduct,
    updateProduct,
    deleteProduct,
    createService,
    updateService,
    deleteService,
    refreshCompany,
    clearError,
    isSaving,
    isProductLoading,
    isServiceLoading
  };

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};