import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/Card';

export interface HourlyBarRow {
  hour: string;
  messages: number;
  client: number;
  bot: number;
}

export interface HourlyMessagesBarChartProps {
  data: HourlyBarRow[];
}

export const HourlyMessagesBarChart: React.FC<HourlyMessagesBarChartProps> = ({ data }) => (
  <Card>
    <VStack gap={4} align="stretch">
      <Text fontSize="lg" fontWeight="semibold">
        Mensagens por Horário
      </Text>
      <Box h="250px">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="client" fill="#6366F1" name="Cliente" />
              <Bar dataKey="bot" fill="#0099FF" name="Bot" />
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
);
