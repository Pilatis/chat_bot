import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';
import { $Enums } from '@prisma/client';
import { generateTokenPair, JwtPayload } from '../../utils/jwt';

type PlanTypes = $Enums.PlanTypes;

const prisma = new PrismaClient();

export interface RegisterData {
  name: string;
  email: string;
  phone: string; // Obrigatório no registro, mas opcional no schema temporariamente
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    planType: PlanTypes;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const { name, email, phone, password } = data;

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Usuário já existe com este email');
    }

    // Verificar se o telefone já existe (apenas se fornecido)
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone }
      });

      if (existingPhone) {
        throw new Error('Usuário já existe com este telefone');
      }
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Buscar plano FREE para criar UserPlan
    const freePlan = await prisma.plan.findFirst({
      where: {
        name: {
          contains: 'FREE',
          mode: 'insensitive'
        }
      }
    });

    if (!freePlan) {
      throw new Error('Plano padrão (FREE) não encontrado. Configure os planos no banco de dados.');
    }

    // Criar usuário (sempre como CLIENT por padrão) e UserPlan
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: UserRole.CLIENT,
        planType: 'FREE' as PlanTypes,
        userPlan: {
          create: {
            planId: freePlan.id,
            planType: 'FREE' as PlanTypes
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        planType: true,
        createdAt: true
      }
    });

    // Gerar tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as string
    };

    const { accessToken, refreshToken } = generateTokenPair(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        planType: user.planType
      },
      accessToken,
      refreshToken
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    // Buscar usuário com planType
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        password: true,
        role: true,
        planType: true
      }
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as string
    };

    const { accessToken, refreshToken } = generateTokenPair(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        planType: user.planType
      },
      accessToken,
      refreshToken
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        planType: true,
        createdAt: true,
        companies: {
          select: {
            id: true,
            name: true,
            description: true,
            whatsappNumber: true,
            createdAt: true
          }
        },
        userPlan: {
          select: {
            planType: true,
            plan: {
              select: {
                name: true,
                price: true,
                limitMessages: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const { verifyRefreshToken } = await import('../../utils/jwt');
      const { generateAccessToken } = await import('../../utils/jwt');
      
      const payload = verifyRefreshToken(refreshToken);
      const accessToken = generateAccessToken(payload);
      
      return { accessToken };
    } catch (error) {
      throw new Error('Token de refresh inválido');
    }
  }
}
