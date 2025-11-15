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
import { useNavigate } from 'react-router-dom';
import { AvatarComponent } from './Avatar';

interface NavbarProps {
  onOpen: () => void;
  display?: any;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpen, display }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          <Text fontSize="h5" fontWeight="h5" color="defaultBlack">
            {user?.name || 'Chatbot'}
          </Text>
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
                <Menu.Item value="perfil">
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
