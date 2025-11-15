import React, { useEffect } from 'react';
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
import { FiCheck, FiStar, FiZap, FiCheckCircle } from 'react-icons/fi';
import { Card } from '../components/Card';
import { Plan } from '../types/plan.types';
import { usePlans } from '../providers';

export const Plans: React.FC = () => {
  const { getAllPlans, allPlans, assignPlan, isLoading, currentPlan, getUserPlan } = usePlans();

  useEffect(() => {
    getAllPlans();
    getUserPlan();
  }, []);

  const handleSubscribe = async (planId: string) => {
    try {
      await assignPlan(planId);
      // Plano atribuído com sucesso - getUserPlan será chamado automaticamente pelo provider
    } catch (error) {
      console.error('Erro ao atribuir plano:', error);
      // Tratar erro - pode mostrar toast/notificação aqui
    }
  };

  const isPlanActive = (plan: Plan): boolean => {
    return currentPlan?.planType === plan.planType;
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
          {allPlans.map((plan: Plan) => {
            const isActive = isPlanActive(plan);
            return (
              <GridItem key={plan.id}>
                <Card
                  position="relative"
                  bg={isActive ? 'green.50' : plan.planType === 'PRO' ? 'blue.50' : 'white'}
                  border={isActive ? '2px' : plan.planType === 'PRO' ? '2px' : '1px'}
                  borderColor={isActive ? 'green.500' : plan.planType === 'PRO' ? 'blue.500' : 'gray.200'}
                  transform={plan.planType === 'PRO' || isActive ? 'scale(1.05)' : 'scale(1)'}
                  transition="all 0.2s"
                >
                  {isActive && (
                    <Badge
                      position="absolute"
                      top="-10px"
                      left="50%"
                      transform="translateX(-50%)"
                      colorScheme="green"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                    >
                      <HStack gap={1}>
                        <FiCheckCircle />
                        <Text>Plano Atual</Text>
                      </HStack>
                    </Badge>
                  )}
                  {!isActive && plan.planType === 'PRO' && (
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
                      {plan.limitMessages} mensagens por {plan.price === 0 ? 'dia' : 'mês'}
                    </Text>
                  </Box>

                  <Box h="1px" bg="gray.200" />

                  <VStack gap={3} align="stretch">
                    {plan.benefits.map((benefit: string, index: number) => (
                      <HStack key={index} align="start">
                        <FiCheck color="green" />
                        <Text fontSize="sm" color="gray.600">
                          {benefit}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>

                  <Button
                    colorScheme={isActive ? 'green' : plan.planType === 'PRO' ? 'blue' : 'gray'}
                    size="lg"
                    w="full"
                    variant={isActive ? 'solid' : plan.planType === 'PRO' ? 'solid' : 'outline'}
                    onClick={() => !isActive && handleSubscribe(plan.id)}
                    loading={isLoading}
                    disabled={isLoading || isActive}
                  >
                    {isActive ? (
                      <>
                        <FiCheckCircle />
                        Plano Atual
                      </>
                    ) : (
                      <>
                        {plan.planType === 'PRO' && <FiZap />}
                        {plan.price === 0 ? 'Começar Grátis' : 'Assinar Plano'}
                      </>
                    )}
                  </Button>
                </VStack>
              </Card>
            </GridItem>
          );
          })}
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

