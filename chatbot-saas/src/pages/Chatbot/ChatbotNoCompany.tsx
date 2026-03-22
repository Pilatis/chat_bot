import React from 'react';
import Link from 'next/link';
import { Box, VStack, Text, Button } from '@chakra-ui/react';
import { FiAlertCircle } from 'react-icons/fi';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/ui/empty-state';

export const ChatbotNoCompany: React.FC = () => (
  <Box>
    <VStack gap={8} align="stretch">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" color="gray.700">
          Assistente
        </Text>
        <Text color="gray.600" mt={1}>
          Sem empresa cadastrada, os campos do assistente não ficam disponíveis. Cadastre sua empresa
          primeiro para criar e configurar o assistente.
        </Text>
      </Box>
      <Card>
        <EmptyState
          title="Cadastre sua empresa primeiro"
          description="Para criar um assistente, você precisa ter uma empresa cadastrada. Vá em Empresa no menu, preencha nome e descrição e salve. Depois volte aqui para criar seu primeiro assistente."
          icon={<FiAlertCircle size={48} color="#f59e0b" />}
        >
          <Button mt={4} bg="contexta.500" color="white" _hover={{ bg: 'contexta.600' }} asChild>
            <Link href="/company">Ir para Empresa</Link>
          </Button>
        </EmptyState>
      </Card>
    </VStack>
  </Box>
);
