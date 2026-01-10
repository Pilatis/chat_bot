import React, { useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  GridItem,
  Spinner,
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
import { useAnalytics } from '../hooks/useAnalytics';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Função para formatar hora (0-23) para string (00:00)
const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

// Função para formatar segundos para string legível
const formatResponseTime = (seconds?: number): string => {
  if (!seconds) return 'N/A';
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs.toFixed(0)}s`;
};

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>('7');
  
  const {
    overview,
    hourlyDistribution,
    topKeywords,
    dashboardData,
    isLoading,
    error,
    getDashboardData,
  } = useAnalytics();

  useEffect(() => {
    getDashboardData(selectedPeriod);
  }, [selectedPeriod]);

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(event.target.value);
  };

  // Preparar dados para o gráfico de volume por dia (últimos 7 dias)
  const messagesData = useMemo(() => {
    if (!dashboardData?.overview) return [];

    // Por enquanto, vamos usar dados simulados baseados no overview
    // Em uma versão futura, podemos adicionar um endpoint específico para isso
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days.map((day) => ({
      name: day,
      messages: Math.floor((dashboardData.overview.todayMessages || 0) * (0.7 + Math.random() * 0.6)),
      responses: Math.floor((dashboardData.overview.messagesByType.bot || 0) * (0.7 + Math.random() * 0.6)),
    }));
  }, [dashboardData]);

  // Preparar dados para distribuição horária
  const hourlyData = useMemo(() => {
    if (!hourlyDistribution || hourlyDistribution.length === 0) return [];

    return hourlyDistribution.map((item) => ({
      hour: formatHour(item.hour),
      messages: item.total,
      client: item.client,
      bot: item.bot,
    }));
  }, [hourlyDistribution]);

  // Preparar dados para distribuição de respostas
  const responseData = useMemo(() => {
    if (!overview) return [];

    const total = overview.messagesByType.bot || 0;
    const automatic = Math.floor(total * 0.95); // Assumindo 95% automáticas por enquanto
    const manual = total - automatic;

    return [
      { name: 'Automáticas', value: automatic, color: '#2563eb' },
      { name: 'Manuais', value: manual, color: '#10b981' },
    ];
  }, [overview]);

  // Preparar palavras mais frequentes
  const frequentWords = useMemo(() => {
    if (!topKeywords || topKeywords.length === 0) return [];
    return topKeywords.slice(0, 6);
  }, [topKeywords]);

  const maxKeywordCount = useMemo(() => {
    if (frequentWords.length === 0) return 1;
    return Math.max(...frequentWords.map((w) => w.count));
  }, [frequentWords]);

  if (isLoading && !dashboardData) {
    return (
      <Box>
        <VStack gap={4} align="center" py={8}>
          <Spinner size="xl" />
          <Text color="gray.600">Carregando analytics...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Box
          p={4}
          bg="red.50"
          border="1px"
          borderColor="red.200"
          borderRadius="md"
          mb={4}
        >
          <Text color="red.700" fontWeight="medium">
            Erro: {error}
          </Text>
        </Box>
      </Box>
    );
  }

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
              <select
                value={selectedPeriod}
                onChange={handlePeriodChange}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <option value="today">Hoje</option>
                <option value="7">Últimos 7 dias</option>
                <option value="14">Últimos 14 dias</option>
                <option value="30">Últimos 30 dias</option>
              </select>
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
                  {messagesData.length > 0 ? (
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
                  ) : (
                    <VStack justify="center" h="100%">
                      <Text color="gray.500">Sem dados disponíveis</Text>
                    </VStack>
                  )}
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
                  {responseData.length > 0 && responseData[0].value > 0 ? (
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
                  ) : (
                    <VStack justify="center" h="100%">
                      <Text color="gray.500">Sem dados disponíveis</Text>
                    </VStack>
                  )}
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
                  {hourlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="client" fill="#2563eb" name="Cliente" />
                        <Bar dataKey="bot" fill="#10b981" name="Bot" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <VStack justify="center" h="100%">
                      <Text color="gray.500">Sem dados disponíveis</Text>
                    </VStack>
                  )}
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
                {frequentWords.length > 0 ? (
                  <VStack gap={2} align="stretch">
                    {frequentWords.map((item, index) => (
                      <HStack key={item.keyword} justify="space-between">
                        <Text fontSize="sm" fontWeight="medium">
                          {item.keyword}
                        </Text>
                        <HStack gap={2}>
                          <Box
                            w={`${(item.count / maxKeywordCount) * 150}px`}
                            h="4px"
                            bg={COLORS[index % COLORS.length]}
                            borderRadius="full"
                          />
                          <Text fontSize="sm" color="gray.600" minW="30px" textAlign="right">
                            {item.count}
                          </Text>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <VStack justify="center" h="100%">
                    <Text color="gray.500">Sem palavras-chave disponíveis</Text>
                  </VStack>
                )}
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
                  {overview?.responseRate
                    ? `${overview.responseRate.toFixed(1)}%`
                    : 'N/A'}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {overview?.responseRate
                    ? `${overview.messagesByType.bot} respostas de ${overview.messagesByType.client} mensagens`
                    : 'Sem dados disponíveis'}
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
                  {formatResponseTime(overview?.averageResponseTime)}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {overview?.averageResponseTime
                    ? 'Tempo médio calculado'
                    : 'Sem dados disponíveis'}
                </Text>
              </VStack>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <VStack gap={3} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Total de Mensagens
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                  {overview?.totalMessages || 0}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {overview?.todayMessages || 0} hoje
                </Text>
              </VStack>
            </Card>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};
