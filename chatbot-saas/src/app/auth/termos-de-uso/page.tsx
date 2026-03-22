'use client';

import React from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Link,
} from '@chakra-ui/react';
import LinkNext from 'next/link';
import { ContextaLogo } from '@/components/ContextaLogo';
import { AUTH_ROUTES } from '@/config/authRoutes';
import { FiArrowLeft } from 'react-icons/fi';

const sections = [
  { id: 'aceitacao', title: '1. Aceitação dos termos' },
  { id: 'servico', title: '2. Descrição do serviço' },
  { id: 'cadastro', title: '3. Cadastro e conta' },
  { id: 'uso', title: '4. Uso aceitável' },
  { id: 'propriedade', title: '5. Propriedade intelectual' },
  { id: 'privacidade', title: '6. Privacidade e dados' },
  { id: 'responsabilidade', title: '7. Limitação de responsabilidade' },
  { id: 'alteracoes', title: '8. Alterações' },
  { id: 'contato', title: '9. Contato' },
];

export default function TermosDeUsoPage() {
  return (
    <Box minH="100vh" bg="white">
      {/* Navbar escura com logo */}
      <Box
        as="nav"
        w="100%"
        style={{ background: 'var(--gradient-secondary)' }}
        borderBottomWidth="1px"
        borderColor="whiteAlpha.200"
        py={4}
        px={6}
      >
        <Container maxW="container.xl">
          <LinkNext href="/">
            <ContextaLogo size="md" />
          </LinkNext>
        </Container>
      </Box>

      {/* Conteúdo branco */}
      <Box flex="1" bg="white" py={10} px={4}>
        <Container maxW="container.md">
          <VStack gap={8} align="stretch">
            <VStack gap={2} align="stretch" textAlign="left">
              <Heading as="h1" size="xl" color="defaultBlack" fontWeight="600">
                Termos de Uso
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Última atualização: Março de 2025
              </Text>
            </VStack>

            {/* Sumário */}
            <Box
              bg="gray.50"
              borderRadius="lg"
              p={5}
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Text fontSize="sm" fontWeight="600" color="defaultBlack" mb={3}>
                Neste documento
              </Text>
              <Flex flexWrap="wrap" gap={2}>
                {sections.map((s) => (
                  <Link
                    key={s.id}
                    as="a"
                    href={`#${s.id}`}
                    fontSize="sm"
                    color="gray.600"
                    _hover={{ color: 'contexta.500', textDecoration: 'underline' }}
                  >
                    {s.title}
                  </Link>
                ))}
              </Flex>
            </Box>

            <VStack gap={6} align="stretch" textAlign="left">
              <Box id="aceitacao">
                <Heading as="h2" size="md" color="defaultBlack" mb={3}>
                  1. Aceitação dos termos
                </Heading>
                <Text color="gray.700" lineHeight="tall">
                  Ao acessar ou utilizar a plataforma Contexta, você concorda em cumprir e estar vinculado a estes Termos de Uso.
                  Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
                </Text>
              </Box>

              <Box id="servico">
                <Heading as="h2" size="md" color="defaultBlack" mb={3}>
                  2. Descrição do serviço
                </Heading>
                <Text color="gray.700" lineHeight="tall">
                  A Contexta oferece uma plataforma de chatbots e automação de atendimento, permitindo que empresas criem,
                  configurem e gerenciem assistentes virtuais para comunicação com seus clientes.
                </Text>
              </Box>

              <Box id="cadastro">
                <Heading as="h2" size="md" color="defaultBlack" mb={3}>
                  3. Cadastro e conta
                </Heading>
                <Text color="gray.700" lineHeight="tall">
                  Para utilizar determinadas funcionalidades, é necessário criar uma conta fornecendo informações verdadeiras e atualizadas.
                  Você é responsável pela confidencialidade de sua senha e por todas as atividades realizadas em sua conta.
                </Text>
              </Box>

              <Box id="uso">
                <Heading as="h2" size="md" color="defaultBlack" mb={3}>
                  4. Uso aceitável
                </Heading>
                <Text color="gray.700" lineHeight="tall">
                  Você concorda em não utilizar a plataforma para fins ilegais, ofensivos ou que violem direitos de terceiros.
                  É proibido o uso para spam, disseminação de conteúdo malicioso ou qualquer atividade que possa prejudicar
                  a infraestrutura ou a experiência de outros usuários.
                </Text>
              </Box>

              <Box id="propriedade">
                <Heading as="h2" size="md" color="defaultBlack" mb={3}>
                  5. Propriedade intelectual
                </Heading>
                <Text color="gray.700" lineHeight="tall">
                  Todo o conteúdo da plataforma Contexta, incluindo marcas, textos, interfaces e software, é de propriedade
                  da Contexta ou de seus licenciadores. O uso não autorizado pode violar leis de propriedade intelectual.
                </Text>
              </Box>

              <Box id="privacidade">
                <Heading as="h2" size="md" color="defaultBlack" mb={3}>
                  6. Privacidade e dados
                </Heading>
                <Text color="gray.700" lineHeight="tall">
                  O tratamento de dados pessoais está descrito em nossa Política de Privacidade. Ao usar a Contexta,
                  você concorda com a coleta e o uso das informações conforme ali descrito.
                </Text>
              </Box>

              <Box id="responsabilidade">
                <Heading as="h2" size="md" color="defaultBlack" mb={3}>
                  7. Limitação de responsabilidade
                </Heading>
                <Text color="gray.700" lineHeight="tall">
                  A Contexta não se responsabiliza por danos indiretos, incidentais ou consequenciais decorrentes do uso
                  ou da impossibilidade de uso da plataforma. Os serviços são oferecidos &quot;como estão&quot;, dentro das
                  possibilidades técnicas e legais aplicáveis.
                </Text>
              </Box>

              <Box id="alteracoes">
                <Heading as="h2" size="md" color="defaultBlack" mb={3}>
                  8. Alterações
                </Heading>
                <Text color="gray.700" lineHeight="tall">
                  Podemos alterar estes Termos de Uso a qualquer momento. Alterações relevantes serão comunicadas por
                  e-mail ou por aviso na plataforma. O uso continuado após as alterações constitui aceitação dos novos termos.
                </Text>
              </Box>

              <Box id="contato">
                <Heading as="h2" size="md" color="defaultBlack" mb={3}>
                  9. Contato
                </Heading>
                <Text color="gray.700" lineHeight="tall">
                  Dúvidas sobre estes termos podem ser enviadas pelo canal de suporte disponível na plataforma ou
                  no site da Contexta.
                </Text>
              </Box>
            </VStack>

            <Flex pt={4} pb={2} justify="flex-start">
              <Link
                as={LinkNext}
                href={AUTH_ROUTES.register}
                display="inline-flex"
                alignItems="center"
                gap={2}
                color="contexta.500"
                fontWeight="600"
                fontSize="sm"
                _hover={{ color: 'contexta.700', textDecoration: 'underline' }}
              >
                <FiArrowLeft size={18} />
                Voltar ao cadastro
              </Link>
            </Flex>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
