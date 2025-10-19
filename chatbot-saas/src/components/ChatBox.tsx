import React, { useState } from 'react';
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
  const [inputValue, setInputValue] = useState('');
  const bgUser = 'primaryButton';
  const bgBot = 'grayInput';

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
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
      h="500px"
      border="1px"
      borderColor="grayBorder"
      borderRadius="xl"
      overflow="hidden"
      bg="white"
    >
      <Box h="400px" p={4} overflowY="auto">
        <VStack gap={4} align="stretch">
          {messages.length === 0 ? (
            <Text color="grayBold" textAlign="center" py={8}>
              Nenhuma mensagem ainda. Digite algo para começar!
            </Text>
          ) : (
            messages.map((message) => (
              <HStack
                key={message.id}
                align={message.isFromBot ? 'flex-start' : 'flex-end'}
                justify={message.isFromBot ? 'flex-start' : 'flex-end'}
                gap={3}
              >
                {message.isFromBot && (
                  <Avatar.Root size="sm" bg="green.500">
                    <Avatar.Image src="" alt="Bot" />
                    <Avatar.Fallback>B</Avatar.Fallback>
                  </Avatar.Root>
                )}
                
                <Box
                  maxW="70%"
                  p={3}
                  borderRadius="lg"
                  bg={message.isFromBot ? bgBot : bgUser}
                  color={message.isFromBot ? 'defaultBlack' : 'white'}
                >
                  <Text fontSize="sm">{message.content}</Text>
                  <Text
                    fontSize="xs"
                    color={message.isFromBot ? 'grayBold' : 'white'}
                    mt={1}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Text>
                </Box>
                
                {!message.isFromBot && (
                  <Avatar.Root size="sm" bg="blue.500">
                    <Avatar.Image src="" alt="Você" />
                    <Avatar.Fallback>V</Avatar.Fallback>
                  </Avatar.Root>
                )}
              </HStack>
            ))
          )}
        </VStack>
      </Box>
      
      <Box p={4} borderTop="1px" borderColor="gray.200">
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
            bg="primaryButton"
            color="white"
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
