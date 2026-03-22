import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { CustomSelect } from '@/components/ui/select';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '14', label: 'Últimos 14 dias' },
  { value: '30', label: 'Últimos 30 dias' },
];

export interface AnalyticsHeaderProps {
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => (
  <Box>
    <HStack justify="space-between" align="center">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" color="gray.700" mb={2}>
          Analytics
        </Text>
        <Text color="gray.600">Estatísticas e insights do seu assistente</Text>
      </Box>
      <Box>
        <CustomSelect
          value={selectedPeriod}
          onChange={onPeriodChange}
          options={PERIOD_OPTIONS}
          size="sm"
          width="180px"
        />
      </Box>
    </HStack>
  </Box>
);
