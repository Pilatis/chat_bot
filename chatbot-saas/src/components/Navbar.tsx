import React from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Avatar,
  Menu,
  Text,
  Portal
} from '@chakra-ui/react';
import { FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AvatarComponent } from './Avatar';
import { ContextaLogo } from './ContextaLogo';
import { AUTH_ROUTES } from '@/config/authRoutes';

interface NavbarProps {
  onOpen: () => void;
  display?: any;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpen, display }) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace(AUTH_ROUTES.login);
  };

  return (
    <Box
      bg="white"
      borderBottom="1px"
      borderColor="grayBorder"
      px={4}
      py={3}
      display={display}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <HStack gap={4}>
          <IconButton
            aria-label="Menu"
            variant="ghost"
            onClick={onOpen}
            display={{ base: 'flex', md: 'none' }}
          >
            <Box>☰</Box>
          </IconButton>
          {user?.name ? (
            <Text fontSize="h5" fontWeight="h5" color="defaultBlack">
              {user.name}
            </Text>
          ) : (
            <ContextaLogo size="sm" centered={false} />
          )}
        </HStack>

        <HStack gap={4}>
          <IconButton aria-label="Notificações" variant="ghost" size="sm">
            <FiBell />
          </IconButton>

          <Menu.Root>
            <Menu.Trigger>
              <AvatarComponent name={user?.name || ''} size="md" />
            </Menu.Trigger>

            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="perfil" onClick={() => router.push('/profile')}>
                  <FiUser />
                  Perfil
                </Menu.Item>
                <Menu.Item value="sair" onClick={handleLogout}>
                  <FiLogOut />
                  Sair
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </HStack>
      </Flex>
    </Box>
  );
};
