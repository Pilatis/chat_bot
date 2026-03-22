import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/Card';

export interface MessageVolumeLineChartProps {
  data: Array<{ name: string; messages: number; responses: number }>;
}

export const MessageVolumeLineChart: React.FC<MessageVolumeLineChartProps> = ({ data }) => (
  <Card>
    <VStack gap={4} align="stretch">
      <Text fontSize="lg" fontWeight="semibold">
        Volume de Mensagens por Dia
      </Text>
      <Box h="300px">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#00A8C9"
                strokeWidth={2}
                name="Mensagens Recebidas"
              />
              <Line
                type="monotone"
                dataKey="responses"
                stroke="#8B5CF6"
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
);
