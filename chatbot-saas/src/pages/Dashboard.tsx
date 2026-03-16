'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  VStack,
  HStack,
  Button,
  Skeleton,
} from '@chakra-ui/react';
import { Card } from '../components/Card';
import { EmptyState } from '../components/ui/empty-state';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useCompany } from '../hooks/useCompany';
import { useAnalytics } from '../hooks/useAnalytics';
import { FiAlertCircle, FiBarChart2 } from 'react-icons/fi';

const PERIOD_LABELS: Record<string, string> = {
  '7': '7 dias',
  '14': '14 dias',
  '30': '30 dias',
  today: 'Hoje',
};

export const Dashboard: React.FC = () => {
  const { company } = useCompany();
  const {
    dashboardData,
    overview,
    hourlyDistribution,
    topKeywords,
    isLoading,
    error,
    getDashboardData,
  } = useAnalytics();

  const [period, setPeriod] = React.useState<string>('7');

  useEffect(() => {
    if (company?.id) getDashboardData(period);
  }, [company?.id, period]);

  if (!company) {
    return (
      <Box>
        <VStack gap={8} align="stretch">
          <Box>
            <Text fontSize="h2" fontWeight="h2" color="defaultBlack" mb={2}>
              Dashboard
            </Text>
          </Box>
          <Card>
            <EmptyState
              title="Cadastre sua empresa"
              description="Para ver métricas e gráficos, cadastre uma empresa na página Empresa e comece a receber mensagens pelo assistente."
              icon={<FiAlertCircle size={48} color="#f59e0b" />}
            />
          </Card>
        </VStack>
      </Box>
    );
  }

  const chartData = (hourlyDistribution || []).map((d) => ({
    hour: `${d.hour}h`,
    total: d.total,
    client: d.client,
    bot: d.bot,
  }));

  const peakHourFormatted =
    overview?.peakHours?.[0] != null
      ? `${String(overview.peakHours[0].hour).padStart(2, '0')}:00`
      : '—';

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <HStack id="tour-dashboard-title" justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Box>
            <Text fontSize="h2" fontWeight="h2" color="defaultBlack" mb={2}>
              Dashboard
            </Text>
            <Text fontSize="h6" color="grayBold">
              Visão geral do seu assistente
            </Text>
          </Box>
          <HStack gap={2}>
            {(['7', '14', '30'] as const).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={period === p ? 'solid' : 'outline'}
                colorPalette="contexta"
                onClick={() => setPeriod(p)}
              >
                {PERIOD_LABELS[p]}
              </Button>
            ))}
          </HStack>
        </HStack>

        {error && (
          <Box p={3} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
            <Text fontSize="sm" color="red.700">
              {error}
            </Text>
          </Box>
        )}

        {isLoading && !dashboardData ? (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
            {[1, 2, 3, 4].map((i) => (
              <GridItem key={i}>
                <Card>
                  <VStack align="start" gap={2}>
                    <Skeleton height="4" width="60%" />
                    <Skeleton height="8" width="40%" />
                  </VStack>
                </Card>
              </GridItem>
            ))}
          </Grid>
        ) : (
          <>
            <Grid id="tour-dashboard-cards" templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
              <GridItem>
                <Card>
                  <VStack align="start" gap={2}>
                    <Text fontSize="small" color="grayBold">
                      Total de Mensagens
                    </Text>
                    <Text fontSize="h2" fontWeight="h2" color="contexta.500">
                      {overview?.totalMessages?.toLocaleString('pt-BR') ?? 0}
                    </Text>
                    <Text fontSize="small" color="contexta.600">
                      Período: {PERIOD_LABELS[period]}
                    </Text>
                  </VStack>
                </Card>
              </GridItem>

              <GridItem>
                <Card>
                  <VStack align="start" gap={2}>
                    <Text fontSize="small" color="grayBold">
                      Mensagens hoje
                    </Text>
                    <Text fontSize="h2" fontWeight="h2" color="contexta.500">
                      {overview?.todayMessages?.toLocaleString('pt-BR') ?? 0}
                    </Text>
                    <Text fontSize="small" color="grayBold">
                      Esta semana: {overview?.thisWeekMessages?.toLocaleString('pt-BR') ?? 0}
                    </Text>
                  </VStack>
                </Card>
              </GridItem>

              <GridItem>
                <Card>
                  <VStack align="start" gap={2}>
                    <Text fontSize="small" color="grayBold">
                      Taxa de Resposta
                    </Text>
                    <Text fontSize="h2" fontWeight="h2" color="contexta.500">
                      {overview?.responseRate != null
                        ? `${Math.round(overview.responseRate)}%`
                        : '—'}
                    </Text>
                    <Text fontSize="small" color="grayBold">
                      {overview?.messagesByType
                        ? `Cliente: ${overview.messagesByType.client} · Bot: ${overview.messagesByType.bot}`
                        : '—'}
                    </Text>
                  </VStack>
                </Card>
              </GridItem>

              <GridItem>
                <Card>
                  <VStack align="start" gap={2}>
                    <Text fontSize="small" color="grayBold">
                      Horário de Pico
                    </Text>
                    <Text fontSize="h2" fontWeight="h2" color="contexta.500">
                      {peakHourFormatted}
                    </Text>
                    <Text fontSize="small" color="grayBold">
                      {overview?.peakHours?.[0]
                        ? `${overview.peakHours[0].count} msgs`
                        : '—'}
                    </Text>
                  </VStack>
                </Card>
              </GridItem>
            </Grid>

            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
              <GridItem>
                <Card id="tour-dashboard-chart">
                  <VStack gap={4} align="stretch">
                    <Text fontSize="h5" fontWeight="h5" color="defaultBlack">
                      Volume de Mensagens por Hora
                    </Text>
                    <Box h="300px">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#6366F1" name="Total" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <VStack h="full" justify="center" color="gray.500">
                          <FiBarChart2 size={48} />
                          <Text fontSize="sm">Nenhum dado no período</Text>
                        </VStack>
                      )}
                    </Box>
                  </VStack>
                </Card>
              </GridItem>

              <GridItem>
                <VStack gap={4} align="stretch">
                  <Card id="tour-dashboard-keywords">
                    <VStack gap={3} align="stretch">
                      <Text fontSize="h5" fontWeight="h5" color="defaultBlack">
                        Palavras mais citadas
                      </Text>
                      <VStack gap={2} align="stretch">
                        {(topKeywords && topKeywords.length > 0) ? (
                          topKeywords.slice(0, 8).map((kw, i) => (
                            <HStack key={i} justify="space-between">
                              <Text fontSize="small" color="grayBold">
                                {kw.keyword}
                              </Text>
                              <Text fontSize="small" color="contexta.600" fontWeight="medium">
                                {kw.count}
                              </Text>
                            </HStack>
                          ))
                        ) : (
                          <Text fontSize="small" color="gray.500">
                            Nenhuma palavra-chave no período
                          </Text>
                        )}
                      </VStack>
                    </VStack>
                  </Card>

                  <Card>
                    <VStack gap={3} align="stretch">
                      <Text fontSize="h5" fontWeight="h5" color="defaultBlack">
                        Status do Bot
                      </Text>
                      <HStack>
                        <Box w={3} h={3} bg="contexta.500" rounded="full" />
                        <Text fontSize="small" color="contexta.600">
                          Dados do dashboard conectados à API
                        </Text>
                      </HStack>
                      <Text fontSize="small" color="grayBold">
                        Período: {PERIOD_LABELS[period]}
                      </Text>
                    </VStack>
                  </Card>
                </VStack>
              </GridItem>
            </Grid>
          </>
        )}
      </VStack>
    </Box>
  );
};
