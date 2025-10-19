import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { Card } from '../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Seg', messages: 45 },
  { name: 'Ter', messages: 52 },
  { name: 'Qua', messages: 38 },
  { name: 'Qui', messages: 67 },
  { name: 'Sex', messages: 89 },
  { name: 'Sáb', messages: 34 },
  { name: 'Dom', messages: 23 },
];

export const Dashboard: React.FC = () => {
  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Text fontSize="h2" fontWeight="h2" color="defaultBlack" mb={2}>
            Dashboard
          </Text>
          <Text fontSize="h6" color="grayBold">
            Visão geral do seu chatbot
          </Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
          <GridItem>
            <Card>
              <VStack align="start" gap={2}>
                <Text fontSize="small" color="grayBold">Total de Mensagens</Text>
                <Text fontSize="h2" fontWeight="h2" color="primaryButton">1,234</Text>
                <Text fontSize="small" color="primary.100">+12% vs mês anterior</Text>
              </VStack>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <VStack align="start" gap={2}>
                <Text fontSize="small" color="grayBold">Atendimentos</Text>
                <Text fontSize="h2" fontWeight="h2" color="primaryButton">456</Text>
                <Text fontSize="small" color="primary.100">+8% vs mês anterior</Text>
              </VStack>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <VStack align="start" gap={2}>
                <Text fontSize="small" color="grayBold">Taxa de Resposta</Text>
                <Text fontSize="h2" fontWeight="h2" color="primaryButton">94%</Text>
                <Text fontSize="small" color="primary.100">+3% vs mês anterior</Text>
              </VStack>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <VStack align="start" gap={2}>
                <Text fontSize="small" color="grayBold">Horário de Pico</Text>
                <Text fontSize="h2" fontWeight="h2" color="primaryButton">14:30</Text>
                <Text fontSize="small" color="grayBold">-2h vs semana anterior</Text>
              </VStack>
            </Card>
          </GridItem>
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          <GridItem>
            <Card>
              <VStack gap={4} align="stretch">
                <Text fontSize="h5" fontWeight="h5" color="defaultBlack">
                  Volume de Mensagens
                </Text>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="messages" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </VStack>
            </Card>
          </GridItem>

          <GridItem>
            <VStack gap={4} align="stretch">
              <Card>
                <VStack gap={3} align="stretch">
                  <Text fontSize="h5" fontWeight="h5" color="defaultBlack">
                    Perguntas Frequentes
                  </Text>
                  <VStack gap={2} align="stretch">
                    <Text fontSize="small" color="grayBold">
                      "Qual o horário de funcionamento?"
                    </Text>
                    <Text fontSize="small" color="grayBold">
                      "Como faço para cancelar?"
                    </Text>
                    <Text fontSize="small" color="grayBold">
                      "Quais são os métodos de pagamento?"
                    </Text>
                    <Text fontSize="small" color="grayBold">
                      "Preciso de ajuda técnica"
                    </Text>
                  </VStack>
                </VStack>
              </Card>

              <Card>
                <VStack gap={3} align="stretch">
                  <Text fontSize="h5" fontWeight="h5" color="defaultBlack">
                    Status do Bot
                  </Text>
                  <HStack>
                    <Box w={3} h={3} bg="green.500" rounded="full" />
                    <Text fontSize="small" color="primary.100">
                      Online e funcionando
                    </Text>
                  </HStack>
                  <Text fontSize="small" color="grayBold">
                    Última atualização: há 2 minutos
                  </Text>
                </VStack>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};