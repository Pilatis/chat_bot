'use client';

import React, { useState, useEffect } from 'react';
import { CompanyContext } from '../context/company-context';
import { CompanyContextType, CreateCompanyData, CreateProductData, UpdateProductData, Company } from '../types/company.types';
import { useApi } from '../hooks/use-api';

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Inicia como true para carregamento inicial
  const [isSaving, setIsSaving] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { api } = useApi();

  const clearError = (): void => setError(null);

  const refreshCompany = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/company');
      
      if (response.data?.success) {
        setCompany(response.data.data);
      } else {
        setError(response.data?.message || 'Erro ao carregar empresa');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const createOrUpdateCompany = async (data: CreateCompanyData): Promise<void> => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await api.post('/company', data);
      
      if (response.data?.success) {
        setCompany(response.data.data);
      } else {
        setError(response.data?.message || 'Erro ao salvar empresa');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar empresa');
    } finally {
      setIsSaving(false);
    }
  };

  const createProduct = async (data: CreateProductData): Promise<void> => {
    if (!company) {
      setError('Empresa não encontrada');
      return;
    }

    try {
      setIsProductLoading(true);
      setError(null);
      
      const response = await api.post(`/company/${company.id}/products`, data);
      
      if (response.data?.success) {
        // Atualizar lista de produtos
        await refreshCompany();
      } else {
        setError(response.data?.message || 'Erro ao criar produto');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar produto');
    } finally {
      setIsProductLoading(false);
    }
  };

  const updateProduct = async (productId: string, data: UpdateProductData): Promise<void> => {
    try {
      setIsProductLoading(true);
      setError(null);
      
      const response = await api.put(`/company/products/${productId}`, data);
      
      if (response.data?.success) {
        // Atualizar lista de produtos
        await refreshCompany();
      } else {
        setError(response.data?.message || 'Erro ao atualizar produto');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar produto');
    } finally {
      setIsProductLoading(false);
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      setIsProductLoading(true);
      setError(null);
      
      const response = await api.deleted(`/company/products/${productId}`);
      
      if (response.data?.success) {
        // Atualizar lista de produtos
        await refreshCompany();
      } else {
        setError(response.data?.message || 'Erro ao deletar produto');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar produto');
    } finally {
      setIsProductLoading(false);
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
    refreshCompany,
    clearError,
    // Estados adicionais para controle mais granular
    isSaving,
    isProductLoading
  } as CompanyContextType;

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};