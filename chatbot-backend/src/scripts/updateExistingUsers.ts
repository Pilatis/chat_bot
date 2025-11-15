import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function updateExistingUsers() {
  try {
    // Buscar todos os usuários sem telefone
    const usersWithoutPhone = await prisma.user.findMany({
      where: {
        phone: {
          equals: ''
        }
      }
    });

    if (usersWithoutPhone.length === 0) {
      console.log('✅ Todos os usuários já possuem telefone');
      return;
    }

    console.log(`📱 Encontrados ${usersWithoutPhone.length} usuário(s) sem telefone`);

    // Atualizar cada usuário com um telefone único baseado no ID
    for (const user of usersWithoutPhone) {
      // Gerar um telefone único baseado no ID do usuário
      // Formato: +5511 + últimos 9 dígitos do UUID
      const phoneSuffix = user.id.replace(/-/g, '').substring(0, 9);
      const phone = `+5511${phoneSuffix}`;

      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { phone }
        });
        console.log(`✅ Usuário ${user.email} atualizado com telefone: ${phone}`);
      } catch (error: any) {
        // Se o telefone já existir, tentar com outro sufixo
        const alternativePhone = `+5511${Date.now().toString().slice(-9)}`;
        await prisma.user.update({
          where: { id: user.id },
          data: { phone: alternativePhone }
        });
        console.log(`✅ Usuário ${user.email} atualizado com telefone: ${alternativePhone}`);
      }
    }

    console.log('\n✅ Todos os usuários foram atualizados com sucesso!');
    console.log('💡 Agora você pode tornar o campo phone obrigatório no schema');
  } catch (error) {
    console.error('❌ Erro ao atualizar usuários:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingUsers();

