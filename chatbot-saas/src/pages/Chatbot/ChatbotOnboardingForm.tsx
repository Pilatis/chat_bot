import React from 'react';
import { Box, VStack, Text, Input, Textarea, Button } from '@chakra-ui/react';
import { FiMessageSquare } from 'react-icons/fi';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/ui/empty-state';
import { phoneMask } from '@/utils/masks';

export interface ChatbotOnboardingFormProps {
  createName: string;
  createDescription: string;
  createWhatsApp: string;
  isCreating: boolean;
  onCreateNameChange: (v: string) => void;
  onCreateDescriptionChange: (v: string) => void;
  onCreateWhatsAppChange: (v: string) => void;
  onSubmit: () => void;
}

export const ChatbotOnboardingForm: React.FC<ChatbotOnboardingFormProps> = ({
  createName,
  createDescription,
  createWhatsApp,
  isCreating,
  onCreateNameChange,
  onCreateDescriptionChange,
  onCreateWhatsAppChange,
  onSubmit,
}) => (
  <Box>
    <VStack gap={8} align="stretch">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" color="gray.700">
          Assistente
        </Text>
        <Text color="gray.600">
          Crie seu primeiro assistente para configurar identidade, treino e teste.
        </Text>
      </Box>

      <Card>
        <VStack gap={6} align="stretch">
          <EmptyState
            title="Crie seu primeiro assistente"
            description="Defina o nome e a descrição do assistente que atenderá seus clientes."
            icon={<FiMessageSquare size={48} color="#9ca3af" />}
          />
          <VStack
            gap={4}
            align="stretch"
            as="form"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <Box>
              <Text mb={2} fontWeight="medium">
                Nome do assistente (obrigatório)
              </Text>
              <Input
                placeholder="Ex: Atendente Virtual"
                value={createName}
                onChange={(e) => onCreateNameChange(e.target.value)}
                size="md"
                disabled={isCreating}
              />
            </Box>
            <Box>
              <Text mb={2} fontWeight="medium">
                Descrição
              </Text>
              <Textarea
                placeholder="O que o assistente vai fazer (ex: tirar dúvidas sobre produtos e horários)"
                value={createDescription}
                onChange={(e) => onCreateDescriptionChange(e.target.value)}
                rows={3}
                resize="vertical"
                disabled={isCreating}
              />
            </Box>
            <Box>
              <Text mb={2} fontWeight="medium" color="gray.600">
                Número para WhatsApp (opcional)
              </Text>
              <Input
                placeholder="(11) 99999-9999"
                value={phoneMask(createWhatsApp)}
                onChange={(e) => onCreateWhatsAppChange(phoneMask(e.target.value))}
                size="md"
                disabled={isCreating}
              />
            </Box>
            <Button
              type="submit"
              bg="contexta.500"
              color="white"
              _hover={{ bg: 'contexta.600' }}
              loading={isCreating}
              disabled={!createName.trim() || isCreating}
              alignSelf="flex-start"
            >
              Criar assistente
            </Button>
          </VStack>
        </VStack>
      </Card>
    </VStack>
  </Box>
);
