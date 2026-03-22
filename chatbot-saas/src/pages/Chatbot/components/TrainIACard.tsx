import React from 'react';
import { VStack, Text, Button, HStack } from '@chakra-ui/react';
import { FiAlertCircle } from 'react-icons/fi';
import { Card } from '@/components/Card';
import { AITrainingAidMessage } from '@/components/company/AI-training-aid-message';

export interface TrainIACardProps {
  isTrained: boolean;
  isTraining: boolean;
  onTrain: () => void;
}

export const TrainIACard: React.FC<TrainIACardProps> = ({ isTrained, isTraining, onTrain }) => (
  <Card id="tour-chatbot-train">
    <VStack gap={6} align="stretch">
      <Text as="h2" fontSize="lg" fontWeight="semibold" color="gray.800">
        Treinar IA com dados da empresa
      </Text>
      <AITrainingAidMessage />
      <Button
        onClick={onTrain}
        bg="green.500"
        color="white"
        size="lg"
        _hover={{ bg: 'green.600' }}
        disabled={!isTrained || isTraining}
        loading={isTraining}
        alignSelf="flex-start"
      >
        {isTrained ? 'Retreinar IA' : 'Treinar IA'}
      </Button>
      {!isTrained && (
        <HStack p={4} bg="orange.50" borderRadius="md" borderWidth="1px" borderColor="orange.200">
          <FiAlertCircle color="var(--chakra-colors-orange-500)" />
          <Text fontSize="sm" color="orange.700">
            Cadastre produtos ou serviços na página Empresa para poder treinar a IA.
          </Text>
        </HStack>
      )}
    </VStack>
  </Card>
);
