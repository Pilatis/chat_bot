import React from 'react';
import { Box, Flex, VStack, HStack, Text } from '@chakra-ui/react';
import { REGISTER_FEATURES } from '../register.constants';

export const RegisterBrandPanel: React.FC = () => (
  <Flex
    display={{ base: 'none', lg: 'flex' }}
    w="45%"
    style={{ background: 'var(--gradient-secondary)' }}
    direction="column"
    align="center"
    justify="center"
    position="relative"
    overflow="hidden"
    p={12}
  >
    <Box
      className="auth-orb-1"
      position="absolute"
      top="-5%"
      right="-5%"
      w="350px"
      h="350px"
      borderRadius="full"
      style={{ background: 'radial-gradient(circle, rgba(0,168,201,0.12) 0%, transparent 70%)' }}
    />
    <Box
      className="auth-orb-2"
      position="absolute"
      bottom="-10%"
      left="-8%"
      w="450px"
      h="450px"
      borderRadius="full"
      style={{ background: 'radial-gradient(circle, rgba(0,153,255,0.1) 0%, transparent 70%)' }}
    />
    <Box
      className="auth-orb-3"
      position="absolute"
      top="35%"
      left="55%"
      w="250px"
      h="250px"
      borderRadius="full"
      style={{ background: 'radial-gradient(circle, rgba(0,168,201,0.08) 0%, transparent 70%)' }}
    />

    <VStack gap={10} position="relative" zIndex={1} maxW="380px">
      <VStack gap={4} textAlign="center">
        <Text fontSize="48px" fontWeight="700" className="gradient-text-primary" lineHeight="1.1">
          Contexta
        </Text>
        <Text fontSize="lg" color="gray.400" fontWeight="300" lineHeight="1.7">
          Comece a transformar seu atendimento ao cliente hoje mesmo
        </Text>
      </VStack>

      <Box w="60px" h="1px" style={{ background: 'var(--gradient-primary)' }} opacity={0.4} />

      <VStack gap={5} align="flex-start" w="full">
        {REGISTER_FEATURES.map((item, i) => (
          <HStack key={i} gap={4}>
            <Flex
              w="44px"
              h="44px"
              minW="44px"
              borderRadius="xl"
              align="center"
              justify="center"
              style={{
                background: 'rgba(0, 168, 201, 0.1)',
                border: '1px solid rgba(0, 168, 201, 0.15)',
              }}
            >
              <item.icon size={18} color="#00A8C9" />
            </Flex>
            <Text color="gray.300" fontSize="sm" fontWeight="400">
              {item.text}
            </Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  </Flex>
);
