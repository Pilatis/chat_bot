import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/Card';

/** Formato compatível com Recharts Pie `data` (exige assinatura de índice). */
export interface ResponseSlice {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export interface ResponseDistributionPieProps {
  data: ResponseSlice[];
}

export const ResponseDistributionPie: React.FC<ResponseDistributionPieProps> = ({ data }) => (
  <Card>
    <VStack gap={4} align="stretch">
      <Text fontSize="lg" fontWeight="semibold">
        Distribuição de Respostas
      </Text>
      <Box h="300px">
        {data.length > 0 && data[0].value > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {data.map((entry, index) => (
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
);
