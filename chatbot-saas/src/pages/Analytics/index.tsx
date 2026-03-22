import React, { useEffect, useState } from 'react';
import { Box, VStack, Grid, GridItem } from '@chakra-ui/react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsLoading } from './AnalyticsLoading';
import { AnalyticsError } from './AnalyticsError';
import { useAnalyticsChartData } from './useAnalyticsChartData';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { MessageVolumeLineChart } from './components/MessageVolumeLineChart';
import { ResponseDistributionPie } from './components/ResponseDistributionPie';
import { HourlyMessagesBarChart } from './components/HourlyMessagesBarChart';
import { TopKeywordsList } from './components/TopKeywordsList';
import { OverviewStatsCards } from './components/OverviewStatsCards';

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7');

  const {
    overview,
    hourlyDistribution,
    topKeywords,
    dashboardData,
    isLoading,
    error,
    getDashboardData,
  } = useAnalytics();

  const { messagesData, hourlyData, responseData, frequentWords, maxKeywordCount } =
    useAnalyticsChartData({
      dashboardData,
      hourlyDistribution,
      topKeywords,
      overview,
    });

  useEffect(() => {
    getDashboardData(selectedPeriod);
  }, [selectedPeriod]);

  if (isLoading && !dashboardData) {
    return <AnalyticsLoading />;
  }

  if (error) {
    return <AnalyticsError message={error} />;
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <AnalyticsHeader selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          <GridItem>
            <MessageVolumeLineChart data={messagesData} />
          </GridItem>
          <GridItem>
            <ResponseDistributionPie data={responseData} />
          </GridItem>
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
          <GridItem>
            <HourlyMessagesBarChart data={hourlyData} />
          </GridItem>
          <GridItem>
            <TopKeywordsList items={frequentWords} maxCount={maxKeywordCount} />
          </GridItem>
        </Grid>

        <OverviewStatsCards overview={overview} />
      </VStack>
    </Box>
  );
};
