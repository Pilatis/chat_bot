// Tipos para empresa
export interface Company {
  id: string;
  name: string;
  description: string | null;
  whatsappNumber: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  products: Product[];
  _count: {
    products: number;
    messages: number;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyData {
  name: string;
  description?: string;
  whatsappNumber?: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price?: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
}

export interface CompanyState {
  company: Company | null;
  isLoading: boolean;
  error: string | null;
}

export interface CompanyContextType extends CompanyState {
  createOrUpdateCompany: (data: CreateCompanyData) => Promise<void>;
  createProduct: (data: CreateProductData) => Promise<void>;
  updateProduct: (productId: string, data: UpdateProductData) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  refreshCompany: () => Promise<void>;
  clearError: () => void;
}
