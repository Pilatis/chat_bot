import React from 'react';
import { Box, VStack, Text, Input, Textarea, Button } from '@chakra-ui/react';
import { FiSave } from 'react-icons/fi';
import { Card } from '@/components/Card';
import { phoneMask } from '@/utils/masks';

export interface CompanyDetailsFormProps {
  companyName: string;
  description: string;
  whatsappNumber: string;
  isSaving: boolean;
  onCompanyNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onWhatsappNumberChange: (v: string) => void;
  onSave: () => void;
}

export const CompanyDetailsForm: React.FC<CompanyDetailsFormProps> = ({
  companyName,
  description,
  whatsappNumber,
  isSaving,
  onCompanyNameChange,
  onDescriptionChange,
  onWhatsappNumberChange,
  onSave,
}) => (
  <Card id="tour-company-form">
    <VStack gap={6} align="stretch">
      <Text fontSize="lg" fontWeight="semibold" color="grayBold">
        Dados da Empresa
      </Text>
      <Box>
        <Text mb={2} fontWeight="medium">
          Nome da Empresa
        </Text>
        <Input
          placeholder="Digite o nome da sua empresa"
          value={companyName}
          onChange={(e) => onCompanyNameChange(e.target.value)}
          size="lg"
          disabled={isSaving}
        />
      </Box>

      <Box>
        <Text mb={2} fontWeight="medium">
          Descrição da Empresa
        </Text>
        <Textarea
          placeholder="Descreva sua empresa, serviços e diferenciais"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          resize="vertical"
          disabled={isSaving}
        />
      </Box>

      <Box>
        <Text mb={2} fontWeight="medium">
          Número do WhatsApp
        </Text>
        <Input
          placeholder="(11) 99999-9999"
          value={phoneMask(whatsappNumber)}
          onChange={(e) => onWhatsappNumberChange(phoneMask(e.target.value))}
          size="lg"
          disabled={isSaving}
        />
      </Box>

      <Button
        onClick={onSave}
        bg="contexta.500"
        color="white"
        size="lg"
        _hover={{ bg: 'contexta.600' }}
        loading={isSaving}
        disabled={isSaving}
        alignSelf="flex-start"
        id="tour-company-save"
      >
        <FiSave />
        Salvar Informações
      </Button>
    </VStack>
  </Card>
);
