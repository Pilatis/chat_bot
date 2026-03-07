import { PrismaClient, MacroCategory } from '@prisma/client';

const prisma = new PrismaClient();

const COMPANY_INCLUDE = {
  products: { orderBy: { createdAt: 'desc' as const } },
  services: { orderBy: { createdAt: 'desc' as const } },
  _count: { select: { products: true, messages: true, services: true } }
};

export interface CreateCompanyData {
  name: string;
  description?: string | undefined;
  whatsappNumber?: string | undefined;
}

export interface UpdateCompanyData {
  name?: string;
  description?: string;
  whatsappNumber?: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price?: number;
  category: MacroCategory;
}

export interface UpdateProductData {
  name?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  category?: MacroCategory | undefined;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price?: number;
  category: MacroCategory;
}

export interface UpdateServiceData {
  name?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  category?: MacroCategory | undefined;
}

export class CompanyService {
  async getCompaniesByUserId(userId: string) {
    return prisma.company.findMany({
      where: { ownerId: userId },
      include: COMPANY_INCLUDE,
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCompanyById(companyId: string) {
    return prisma.company.findUnique({
      where: { id: companyId },
      include: COMPANY_INCLUDE
    });
  }

  async createCompany(userId: string, data: CreateCompanyData) {
    return prisma.company.create({
      data: {
        name: data.name,
        description: data.description || null,
        whatsappNumber: data.whatsappNumber || null,
        ownerId: userId
      },
      include: COMPANY_INCLUDE
    });
  }

  async updateCompany(companyId: string, data: UpdateCompanyData) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData['name'] = data.name;
    if (data.description !== undefined) updateData['description'] = data.description || null;
    if (data.whatsappNumber !== undefined) updateData['whatsappNumber'] = data.whatsappNumber || null;

    return prisma.company.update({
      where: { id: companyId },
      data: updateData,
      include: COMPANY_INCLUDE
    });
  }

  async getProducts(companyId: string) {
    return prisma.product.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createProduct(companyId: string, data: CreateProductData) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price ?? null,
        category: data.category,
        companyId
      }
    });
  }

  async updateProduct(productId: string, companyId: string, data: UpdateProductData) {
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId }
    });

    if (!product) {
      throw new Error('Produto não encontrado nesta empresa');
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData['name'] = data.name;
    if (data.description !== undefined) updateData['description'] = data.description;
    if (data.price !== undefined) updateData['price'] = data.price;
    if (data.category !== undefined) updateData['category'] = data.category;

    return prisma.product.update({
      where: { id: productId },
      data: updateData
    });
  }

  async deleteProduct(productId: string, companyId: string) {
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId }
    });

    if (!product) {
      throw new Error('Produto não encontrado nesta empresa');
    }

    await prisma.product.delete({ where: { id: productId } });
    return { message: 'Produto deletado com sucesso' };
  }

  async getServices(companyId: string) {
    return prisma.service.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createService(companyId: string, data: CreateServiceData) {
    return prisma.service.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price ?? null,
        category: data.category,
        companyId
      }
    });
  }

  async updateService(serviceId: string, companyId: string, data: UpdateServiceData) {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, companyId }
    });

    if (!service) {
      throw new Error('Serviço não encontrado nesta empresa');
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData['name'] = data.name;
    if (data.description !== undefined) updateData['description'] = data.description;
    if (data.price !== undefined) updateData['price'] = data.price;
    if (data.category !== undefined) updateData['category'] = data.category;

    return prisma.service.update({
      where: { id: serviceId },
      data: updateData
    });
  }

  async deleteService(serviceId: string, companyId: string) {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, companyId }
    });

    if (!service) {
      throw new Error('Serviço não encontrado nesta empresa');
    }

    await prisma.service.delete({ where: { id: serviceId } });
    return { message: 'Serviço deletado com sucesso' };
  }

  async getCompanyStats(companyId: string) {
    return prisma.company.findUnique({
      where: { id: companyId },
      select: {
        _count: { select: { products: true, messages: true, services: true } },
        products: { select: { id: true, name: true, price: true } },
        services: { select: { id: true, name: true, price: true } }
      }
    });
  }
}
