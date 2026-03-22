import React from 'react';
import { Box, VStack, Text, HStack } from '@chakra-ui/react';
import { Card } from '@/components/Card';
import type { TopKeyword } from '@/types/analytics.types';
import { ANALYTICS_KEYWORD_COLORS } from '../utils';

export interface TopKeywordsListProps {
  items: TopKeyword[];
  maxCount: number;
}

export const TopKeywordsList: React.FC<TopKeywordsListProps> = ({ items, maxCount }) => (
  <Card>
    <VStack gap={4} align="stretch">
      <Text fontSize="lg" fontWeight="semibold">
        Palavras Mais Frequentes
      </Text>
      {items.length > 0 ? (
        <VStack gap={2} align="stretch">
          {items.map((item, index) => (
            <HStack key={item.keyword} justify="space-between">
              <Text fontSize="sm" fontWeight="medium">
                {item.keyword}
              </Text>
              <HStack gap={2}>
                <Box
                  w={`${(item.count / maxCount) * 150}px`}
                  h="4px"
                  bg={ANALYTICS_KEYWORD_COLORS[index % ANALYTICS_KEYWORD_COLORS.length]}
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
);
