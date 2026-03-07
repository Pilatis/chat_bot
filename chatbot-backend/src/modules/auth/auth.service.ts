import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient, UserRole } from '@prisma/client';
import { $Enums } from '@prisma/client';
import { generateTokenPair, verifyRefreshToken, generateAccessToken, JwtPayload } from '../../utils/jwt';
import { EmailService } from '../../services/email.service';

type PlanTypes = $Enums.PlanTypes;

const prisma = new PrismaClient();
const emailService = new EmailService();

export interface RegisterData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
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
    phone: string;
    role: UserRole;
    planType: PlanTypes;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: { id: string; name: string; email: string };
  message: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateVerificationToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hash: hashToken(token) };
}

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  cpf: true,
  role: true,
  planType: true,
  isEmailVerified: true,
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
} as const;

export class AuthService {
  async register(data: RegisterData): Promise<RegisterResponse> {
    const { name, email, cpf, phone, password } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Usuário já existe com este email');
    }

    const existingCpf = await prisma.user.findUnique({ where: { cpf } });
    if (existingCpf) {
      throw new Error('Usuário já existe com este CPF');
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      throw new Error('Usuário já existe com este telefone');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const freePlan = await prisma.plan.findFirst({
      where: { name: { contains: 'FREE', mode: 'insensitive' } }
    });

    if (!freePlan) {
      throw new Error('Plano padrão (FREE) não encontrado. Configure os planos no banco de dados.');
    }

    const { token, hash } = generateVerificationToken();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        phone,
        password: hashedPassword,
        role: UserRole.CLIENT,
        planType: 'FREE' as PlanTypes,
        isEmailVerified: false,
        emailVerifyTokenHash: hash,
        emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        userPlan: {
          create: {
            planId: freePlan.id,
            planType: 'FREE' as PlanTypes
          }
        }
      },
      select: { id: true, name: true, email: true }
    });

    await emailService.sendVerificationEmail(email, token, name);

    return {
      user: { id: user.id, name: user.name, email: user.email },
      message: 'Conta criada com sucesso! Verifique seu email para ativar sua conta.'
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, name: true, email: true, phone: true,
        password: true, role: true, planType: true, isEmailVerified: true
      }
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    if (!user.isEmailVerified) {
      throw new Error('Confirme seu email antes de acessar a plataforma');
    }

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

  async verifyEmail(token: string): Promise<void> {
    const hash = hashToken(token);

    const user = await prisma.user.findFirst({
      where: { emailVerifyTokenHash: hash }
    });

    if (!user) {
      throw new Error('Token de verificação inválido');
    }

    if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) {
      throw new Error('Token de verificação expirado');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyTokenHash: null,
        emailVerifyExpires: null
      }
    });
  }

  async resendVerification(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return;
    }

    if (user.isEmailVerified) {
      throw new Error('Este email já foi verificado');
    }

    const { token, hash } = generateVerificationToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyTokenHash: hash,
        emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    await emailService.sendVerificationEmail(email, token, user.name);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return;
    }

    const { token, hash } = generateVerificationToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordTokenHash: hash,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000)
      }
    });

    await emailService.sendPasswordResetEmail(email, token, user.name);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hash = hashToken(token);

    const user = await prisma.user.findFirst({
      where: { resetPasswordTokenHash: hash }
    });

    if (!user) {
      throw new Error('Token de redefinição inválido');
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new Error('Token de redefinição expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordTokenHash: null,
        resetPasswordExpires: null
      }
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: PROFILE_SELECT
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    if (data.phone !== undefined && data.phone.trim() !== '') {
      const existing = await prisma.user.findFirst({
        where: { phone: data.phone.trim(), id: { not: userId } }
      });
      if (existing) {
        throw new Error('Este telefone já está em uso');
      }
    }

    const updateData: Record<string, string> = {};
    if (data.name !== undefined) updateData['name'] = data.name.trim();
    if (data.phone !== undefined && data.phone.trim() !== '') updateData['phone'] = data.phone.trim();

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: PROFILE_SELECT
    });
  }

  async refreshToken(refreshTokenValue: string): Promise<{ accessToken: string }> {
    try {
      const payload = verifyRefreshToken(refreshTokenValue);
      const accessToken = generateAccessToken(payload);
      return { accessToken };
    } catch {
      throw new Error('Token de refresh inválido');
    }
  }
}
