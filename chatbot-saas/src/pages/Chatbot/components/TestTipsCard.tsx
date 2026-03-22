import React from 'react';
import { VStack, Text } from '@chakra-ui/react';
import { Card } from '@/components/Card';
import { CHATBOT_TEST_TIPS } from '../constants';

export const TestTipsCard: React.FC = () => (
  <Card id="tour-chatbot-tips">
    <VStack gap={4} align="stretch">
      <Text as="h2" fontSize="lg" fontWeight="semibold" color="gray.800">
        Dicas para testar
      </Text>
      <VStack gap={2} align="stretch">
        {CHATBOT_TEST_TIPS.map((dica, i) => (
          <Text key={i} fontSize="sm" color="gray.600">
            • &quot;{dica}&quot;
          </Text>
        ))}
      </VStack>
    </VStack>
  </Card>
);
