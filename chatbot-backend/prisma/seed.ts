import { PrismaClient, PlanTypes } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Apaga os planos existentes (opcional)
  await prisma.plan.deleteMany();

  await prisma.plan.createMany({
    data: [
      {
        name: "Free",
        planType: PlanTypes.FREE,
        price: 0,
        limitMessages: 20,
        benefits: [
          "20 mensagens por dia",
          "Suporte por email",
          "Dashboard básico",
          "1 chatbot"
        ]
      },
      {
        name: "Básico",
        planType: PlanTypes.BASIC,
        price: 59,
        limitMessages: 500,
        benefits: [
          "500 mensagens por mês",
          "Suporte prioritário",
          "Analytics completos",
          "Até 3 chatbots",
          "Integração WhatsApp",
          "Relatórios mensais"
        ]
      },
      {
        name: "Pro",
        planType: PlanTypes.PRO,
        price: 149,
        limitMessages: 2000,
        benefits: [
          "2000 mensagens por mês",
          "Suporte 24/7",
          "Analytics avançados",
          "Chatbots ilimitados",
          "Integração WhatsApp + Telegram",
          "Relatórios personalizados",
          "API para desenvolvedores",
          "Treinamento personalizado"
        ]
      }
    ]
  });

  console.log("✨ Planos cadastrados com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
