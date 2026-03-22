// Macro-categorias oficiais CONTEXTA (enumeração fixa)
export type MacroCategory =
  | 'TECNOLOGIA'
  | 'SAUDE_E_BEM_ESTAR'
  | 'EDUCACAO'
  | 'CONSULTORIA_E_SERVICOS_PROFISSIONAIS'
  | 'COMERCIO_E_VAREJO'
  | 'INDUSTRIA_E_PRODUCAO'
  | 'SERVICOS_OPERACIONAIS'
  | 'FINANCEIRO'
  | 'IMOBILIARIO'
  | 'OUTROS';

export const MACRO_CATEGORIES: { value: MacroCategory; label: string }[] = [
  { value: 'TECNOLOGIA', label: 'Tecnologia' },
  { value: 'SAUDE_E_BEM_ESTAR', label: 'Saúde e Bem-estar' },
  { value: 'EDUCACAO', label: 'Educação' },
  { value: 'CONSULTORIA_E_SERVICOS_PROFISSIONAIS', label: 'Consultoria e Serviços Profissionais' },
  { value: 'COMERCIO_E_VAREJO', label: 'Comércio e Varejo' },
  { value: 'INDUSTRIA_E_PRODUCAO', label: 'Indústria e Produção' },
  { value: 'SERVICOS_OPERACIONAIS', label: 'Serviços Operacionais' },
  { value: 'FINANCEIRO', label: 'Financeiro' },
  { value: 'IMOBILIARIO', label: 'Imobiliário' },
  { value: 'OUTROS', label: 'Outros' }
];

export function getMacroCategoryLabel(value: MacroCategory): string {
  return MACRO_CATEGORIES.find(c => c.value === value)?.label ?? value;
}

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
  services: Service[];
  _count: {
    products: number;
    messages: number;
    services: number;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: MacroCategory;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: MacroCategory;
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
  description: string;
  price?: number;
  category: MacroCategory;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: MacroCategory;
}

export interface CreateServiceData {
  name: string;
  description: string;
  price?: number;
  category: MacroCategory;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  category?: MacroCategory;
}

export interface CompanyState {
  company: Company | null;
  isLoading: boolean;
  error: string | null;
}

export type ProviderResult = 'success' | 'failure' | void;

export interface CompanyContextType extends CompanyState {
  createOrUpdateCompany: (data: CreateCompanyData) => Promise<ProviderResult>;
  createProduct: (data: CreateProductData) => Promise<ProviderResult>;
  updateProduct: (productId: string, data: UpdateProductData) => Promise<ProviderResult>;
  deleteProduct: (productId: string) => Promise<ProviderResult>;
  createService: (data: CreateServiceData) => Promise<ProviderResult>;
  updateService: (serviceId: string, data: UpdateServiceData) => Promise<ProviderResult>;
  deleteService: (serviceId: string) => Promise<ProviderResult>;
  refreshCompany: () => Promise<void>;
  clearError: () => void;
  isSaving?: boolean;
  isProductLoading?: boolean;
  isServiceLoading?: boolean;
}
