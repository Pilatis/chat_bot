import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '../components/Card';

const messagesData = [
  { name: 'Seg', messages: 45, responses: 42 },
  { name: 'Ter', messages: 52, responses: 48 },
  { name: 'Qua', messages: 38, responses: 35 },
  { name: 'Qui', messages: 67, responses: 62 },
  { name: 'Sex', messages: 89, responses: 84 },
  { name: 'Sáb', messages: 34, responses: 30 },
  { name: 'Dom', messages: 23, responses: 20 },
];

const hourlyData = [
  { hour: '00:00', messages: 2 },
  { hour: '06:00', messages: 5 },
  { hour: '09:00', messages: 15 },
  { hour: '12:00', messages: 25 },
  { hour: '15:00', messages: 30 },
  { hour: '18:00', messages: 35 },
  { hour: '21:00', messages: 20 },
];

const responseData = [
  { name: 'Automáticas', value: 75, color: '#2563eb' },
  { name: 'Manuais', value: 25, color: '#10b981' },
];

const frequentWords = [
  { word: 'preço', count: 45 },
  { word: 'horário', count: 32 },
  { word: 'produto', count: 28 },
  { word: 'pagamento', count: 24 },
  { word: 'cancelar', count: 18 },
  { word: 'suporte', count: 15 },
];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Analytics: React.FC = () => {

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <HStack justify="space-between" align="center">
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.700" mb={2}>
                Analytics
              </Text>
              <Text color="gray.600">
                Estatísticas e insights do seu chatbot
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">Últimos 7 dias</Text>
            </Box>
          </HStack>
        </Box>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          <GridItem>
            <Card>
              <VStack gap={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Volume de Mensagens por Dia
                </Text>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={messagesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="messages" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        name="Mensagens Recebidas"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="responses" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Respostas Enviadas"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </VStack>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <VStack gap={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Distribuição de Respostas
                </Text>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={responseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {responseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </VStack>
            </Card>
          </GridItem>
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
          <GridItem>
            <Card>
              <VStack gap={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Mensagens por Horário
                </Text>
                <Box h="250px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="messages" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </VStack>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <VStack gap={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Palavras Mais Frequentes
                </Text>
                <VStack gap={2} align="stretch">
                  {frequentWords.map((item, index) => (
                    <HStack key={item.word} justify="space-between">
                      <Text fontSize="sm">{item.word}</Text>
                      <HStack gap={2}>
                        <Box
                          w={`${(item.count / 45) * 100}px`}
                          h="4px"
                          bg={COLORS[index % COLORS.length]}
                          borderRadius="full"
                        />
                        <Text fontSize="sm" color="gray.600">
                          {item.count}
                        </Text>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </Card>
          </GridItem>
        </Grid>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
          <GridItem>
            <Card>
              <VStack gap={3} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Taxa de Resposta
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.500">
                  94%
                </Text>
                <Text fontSize="sm" color="gray.600">
                  +2% vs mês anterior
                </Text>
              </VStack>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <VStack gap={3} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Tempo Médio de Resposta
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  2.3s
                </Text>
                <Text fontSize="sm" color="gray.600">
                  -0.5s vs mês anterior
                </Text>
              </VStack>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <VStack gap={3} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Satisfação do Cliente
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                  4.8/5
                </Text>
                <Text fontSize="sm" color="gray.600">
                  +0.2 vs mês anterior
                </Text>
              </VStack>
            </Card>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

