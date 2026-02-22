import { PrismaClient, MacroCategory } from '@prisma/client';

const prisma = new PrismaClient();

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
  async getCompanyByUserId(userId: string) {
    const company = await prisma.company.findFirst({
      where: { ownerId: userId },
      include: {
        products: {
          orderBy: { createdAt: 'desc' }
        },
        services: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            products: true,
            messages: true,
            services: true
          }
        }
      }
    });

    return company;
  }

  async createOrUpdateCompany(userId: string, data: CreateCompanyData) {
    // Verificar se já existe uma empresa para este usuário
    const existingCompany = await prisma.company.findFirst({
      where: { ownerId: userId }
    });

    if (existingCompany) {
      // Atualizar empresa existente
      const updatedCompany = await prisma.company.update({
        where: { id: existingCompany.id },
        data: {
          name: data.name,
          description: data.description || null,
          whatsappNumber: data.whatsappNumber || null
        },
        include: {
          products: {
            orderBy: { createdAt: 'desc' }
          },
          services: {
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              products: true,
              messages: true,
              services: true
            }
          }
        }
      });

      return updatedCompany;
    } else {
      // Criar nova empresa
      const newCompany = await prisma.company.create({
        data: {
          name: data.name,
          description: data.description || null,
          whatsappNumber: data.whatsappNumber || null,
          ownerId: userId
        },
        include: {
          products: {
            orderBy: { createdAt: 'desc' }
          },
          services: {
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              products: true,
              messages: true,
              services: true
            }
          }
        }
      });

      return newCompany;
    }
  }

  async getProducts(companyId: string, userId: string) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const products = await prisma.product.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });

    return products;
  }

  async createProduct(companyId: string, userId: string, data: CreateProductData) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price ?? null,
        category: data.category,
        companyId
      }
    });

    return product;
  }

  async updateProduct(productId: string, userId: string, data: UpdateProductData) {
    // Verificar se o produto pertence a uma empresa do usuário
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        company: {
          ownerId: userId
        }
      }
    });

    if (!product) {
      throw new Error('Produto não encontrado ou não pertence ao usuário');
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData['name'] = data.name;
    if (data.description !== undefined) updateData['description'] = data.description;
    if (data.price !== undefined) updateData['price'] = data.price;
    if (data.category !== undefined) updateData['category'] = data.category;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData
    });

    return updatedProduct;
  }

  async deleteProduct(productId: string, userId: string) {
    // Verificar se o produto pertence a uma empresa do usuário
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        company: {
          ownerId: userId
        }
      }
    });

    if (!product) {
      throw new Error('Produto não encontrado ou não pertence ao usuário');
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    return { message: 'Produto deletado com sucesso' };
  }

  async getServices(companyId: string, userId: string) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const services = await prisma.service.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });

    return services;
  }

  async createService(companyId: string, userId: string, data: CreateServiceData) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const service = await prisma?.service?.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price ?? null,
        category: data.category,
        companyId
      }
    });

    return service;
  }

  async updateService(serviceId: string, userId: string, data: UpdateServiceData) {
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        company: {
          ownerId: userId
        }
      }
    });

    if (!service) {
      throw new Error('Serviço não encontrado ou não pertence ao usuário');
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData['name'] = data.name;
    if (data.description !== undefined) updateData['description'] = data.description;
    if (data.price !== undefined) updateData['price'] = data.price;
    if (data.category !== undefined) updateData['category'] = data.category;

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData
    });

    return updatedService;
  }

  async deleteService(serviceId: string, userId: string) {
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        company: {
          ownerId: userId
        }
      }
    });

    if (!service) {
      throw new Error('Serviço não encontrado ou não pertence ao usuário');
    }

    await prisma.service.delete({
      where: { id: serviceId }
    });

    return { message: 'Serviço deletado com sucesso' };
  }

  async getCompanyStats(companyId: string, userId: string) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const stats = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        _count: {
          select: {
            products: true,
            messages: true,
            services: true
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            price: true
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });

    return stats;
  }
}
