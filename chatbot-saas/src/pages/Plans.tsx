import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  GridItem,
  Button,
  Badge,
} from '@chakra-ui/react';
import { FiCheck, FiStar, FiZap } from 'react-icons/fi';
import { Card } from '../components/Card';
import { Plan } from '../types/plan.types';

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    messagesLimit: 20,
    features: [
      '20 mensagens por dia',
      'Suporte por email',
      'Dashboard básico',
      '1 chatbot',
    ],
  },
  {
    id: 'basic',
    name: 'Básico',
    price: 59,
    messagesLimit: 500,
    features: [
      '500 mensagens por mês',
      'Suporte prioritário',
      'Analytics completos',
      'Até 3 chatbots',
      'Integração WhatsApp',
      'Relatórios mensais',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 149,
    messagesLimit: 2000,
    features: [
      '2000 mensagens por mês',
      'Suporte 24/7',
      'Analytics avançados',
      'Chatbots ilimitados',
      'Integração WhatsApp + Telegram',
      'Relatórios personalizados',
      'API para desenvolvedores',
      'Treinamento personalizado',
    ],
    isPopular: true,
  },
];

export const Plans: React.FC = () => {

  const handleSubscribe = (planId: string) => {
    // Simular assinatura
    console.log(`Assinando plano: ${planId}`);
  };

  return (
    <Box>
      <VStack gap={8} align="stretch">
        <Box textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" color="gray.700" mb={4}>
            Escolha seu Plano
          </Text>
          <Text fontSize="lg" color="gray.600" maxW="600px" mx="auto">
            Selecione o plano que melhor se adequa às necessidades da sua empresa.
            Todos os planos incluem treinamento da IA e suporte.
          </Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6} columnGap={5}>
          {plans.map((plan) => (
            <GridItem key={plan.id}>
              <Card
                position="relative"
                bg={plan.isPopular ? 'blue.50' : 'white'}
                border={plan.isPopular ? '2px' : '1px'}
                borderColor={plan.isPopular ? 'blue.500' : 'gray.200'}
                transform={plan.isPopular ? 'scale(1.05)' : 'scale(1)'}
                transition="all 0.2s"
              >
                {plan.isPopular && (
                  <Badge
                    position="absolute"
                    top="-10px"
                    left="50%"
                    transform="translateX(-50%)"
                    colorScheme="blue"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                  >
                    <HStack gap={1}>
                      <FiStar />
                      <Text>Mais Popular</Text>
                    </HStack>
                  </Badge>
                )}

                <VStack gap={6} align="stretch">
                  <Box textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                      {plan.name}
                    </Text>
                    <HStack justify="center" align="baseline" mt={2}>
                      <Text fontSize="4xl" fontWeight="bold" color="blue.600">
                        R$ {plan.price}
                      </Text>
                      {plan.price > 0 && (
                        <Text fontSize="lg" color="gray.500">
                          /mês
                        </Text>
                      )}
                    </HStack>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {plan.messagesLimit} mensagens por {plan.price === 0 ? 'dia' : 'mês'}
                    </Text>
                  </Box>

                  <Box h="1px" bg="gray.200" />

                  <VStack gap={3} align="stretch">
                    {plan.features.map((feature, index) => (
                      <HStack key={index} align="start">
                        <FiCheck color="green" />
                        <Text fontSize="sm" color="gray.600">
                          {feature}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>

                  <Button
                    colorScheme={plan.isPopular ? 'blue' : 'gray'}
                    size="lg"
                    w="full"
                    variant={plan.isPopular ? 'solid' : 'outline'}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {plan.isPopular && <FiZap />}
                    {plan.price === 0 ? 'Começar Grátis' : 'Assinar Plano'}
                  </Button>
                </VStack>
              </Card>
            </GridItem>
          ))}
        </Grid>

        <Card>
          <VStack gap={4} align="stretch">
            <Text fontSize="lg" fontWeight="semibold" textAlign="center">
              Perguntas Frequentes
            </Text>
            
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Posso mudar de plano a qualquer momento?
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                    As mudanças são aplicadas imediatamente.
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>
                    O que acontece se eu exceder o limite de mensagens?
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Você será notificado quando estiver próximo do limite. Mensagens extras
                    são cobradas a R$ 0,10 cada.
                  </Text>
                </Box>
              </VStack>

              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Posso cancelar minha assinatura?
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Sim, você pode cancelar a qualquer momento. Não há taxas de cancelamento
                    e você mantém acesso até o final do período pago.
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Oferecem suporte técnico?
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Sim! Oferecemos suporte por email para todos os planos e suporte 24/7
                    para planos Pro.
                  </Text>
                </Box>
              </VStack>
            </Grid>
          </VStack>
        </Card>
      </VStack>
    </Box>
  );
};

