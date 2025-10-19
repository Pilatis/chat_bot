import { PrismaClient } from '@prisma/client';

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
}

export interface UpdateProductData {
  name?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
}

export class CompanyService {
  async getCompanyByUserId(userId: string) {
    const company = await prisma.company.findFirst({
      where: { ownerId: userId },
      include: {
        products: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            products: true,
            messages: true
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
          _count: {
            select: {
              products: true,
              messages: true
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
          _count: {
            select: {
              products: true,
              messages: true
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
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const product = await prisma.product.create({
      data: {
        ...data,
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

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;

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
            messages: true
          }
        },
        products: {
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
