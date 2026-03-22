import React from 'react';
import { Grid, GridItem, VStack, Text } from '@chakra-ui/react';
import { Card } from '@/components/Card';
import type { AnalyticsOverview } from '@/types/analytics.types';
import { formatResponseTime } from '../utils';

export interface OverviewStatsCardsProps {
  overview: AnalyticsOverview | null;
}

export const OverviewStatsCards: React.FC<OverviewStatsCardsProps> = ({ overview }) => (
  <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
    <GridItem>
      <Card>
        <VStack gap={3} align="stretch">
          <Text fontSize="lg" fontWeight="semibold">
            Taxa de Resposta
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color="green.500">
            {overview?.responseRate ? `${overview.responseRate.toFixed(1)}%` : 'N/A'}
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
          <Text fontSize="3xl" fontWeight="bold" color="contexta.500">
            {formatResponseTime(overview?.averageResponseTime)}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {overview?.averageResponseTime ? 'Tempo médio calculado' : 'Sem dados disponíveis'}
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
          <Text fontSize="3xl" fontWeight="bold" color="contexta.600">
            {overview?.totalMessages || 0}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {overview?.todayMessages || 0} hoje
          </Text>
        </VStack>
      </Card>
    </GridItem>
  </Grid>
);
