import { useContext } from 'react';
import { CompanyContext } from '../context/company-context';
import { CompanyContextType } from '../types/company.types';

// Hook para usar empresa
export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany deve ser usado dentro de um CompanyProvider');
  }
  return context;
};

// Hook para produtos específicos
export const useProducts = () => {
  const { company, createProduct, updateProduct, deleteProduct } = useCompany();

  const products = company?.products || [];

  return {
    products,
    createProduct,
    updateProduct,
    deleteProduct
  };
};