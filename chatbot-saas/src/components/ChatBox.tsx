import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Avatar,
} from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';
import { useCompany } from '@/hooks';

interface Message {
  id: string;
  content: string;
  isFromBot: boolean;
  timestamp: Date;
}

interface ChatBoxProps {
  messages?: Message[];
  onSendMessage?: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ 
  messages = [], 
  onSendMessage,
  disabled = false,
  loading = false
}) => {
  const { company } = useCompany();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bgUser = 'contexta.500';
  const bgBot = 'gray.100';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      w="full"
      h={company ? '500px' : 'auto'}
      border="1px"
      borderColor="grayBorder"
      borderRadius="xl"
      overflow="hidden"
      bg="white"
    >
      <Box h={company ? '400px' : '200px'} p={4} overflowY="auto">
        <VStack gap={4} align="stretch">
          {messages.length === 0 ? (
            company ? (
              <Text color="grayBold" textAlign="center" py={8}>
                Nenhuma mensagem ainda. Digite algo para começar!
              </Text>
            ) : (
              <Text color="grayBold" textAlign="center" py={8}>
                Você não tem uma empresa cadastrada. Crie uma empresa para começar a usar o chatbot.
              </Text>
            )
          ) : (
            messages.map((message) => (
              <HStack
                key={message.id}
                align={message.isFromBot ? 'flex-start' : 'flex-end'}
                justify={message.isFromBot ? 'flex-start' : 'flex-end'}
                gap={3}
              >
                {message.isFromBot && (
                  <Avatar.Root size="sm" bg="contexta.500">
                    <Avatar.Image src="" alt="Bot" />
                    <Avatar.Fallback>B</Avatar.Fallback>
                  </Avatar.Root>
                )}
                
                <Box
                  maxW="70%"
                  minW="6.5%"
                  p={3}
                  borderRadius="lg"
                  bg={message.isFromBot ? bgBot : bgUser}
                  color={message.isFromBot ? 'gray.700' : 'white'}
                >
                  <Text fontSize="sm">{message.content}</Text>
                  <Text
                    fontSize="xs"
                    color={message.isFromBot ? 'gray.500' : 'gray.200'}
                    mt={1}
                  >
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Box>
                
                {!message.isFromBot && (
                  <Avatar.Root size="sm" bg="contexta.600">
                    <Avatar.Image src="" alt="Você" />
                    <Avatar.Fallback>V</Avatar.Fallback>
                  </Avatar.Root>
                )}
              </HStack>
            ))
          )}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>
      
      <Box p={4} borderTop="1px" borderColor="grayBorder">
        <HStack gap={2}>
          <Input
            placeholder="Digite uma pergunta..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            size="sm"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            size="sm"
            bg="contexta.500"
            color="white"
            _hover={{ bg: 'contexta.600' }}
            loading={loading}
          >
            <FiSend />
            Enviar
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};
