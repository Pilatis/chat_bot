import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import {
  FiHome,
  FiSettings,
  FiMessageSquare,
  FiBarChart,
  FiCreditCard,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { SiWhatsapp } from 'react-icons/si';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ContextaLogo } from './ContextaLogo';

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface NavItemProps {
  icon: any;
  children: React.ReactNode;
  to: string;
  onClose?: () => void;
  isCollapsed?: boolean;
}

const NavItem = ({ icon, children, to, onClose, isCollapsed }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === to;

  return (
    <Link href={to} onClick={onClose}>
      <HStack
        p={3}
        rounded="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'contexta.500' : 'transparent'}
        color={isActive ? 'white' : 'gray.300'}
        _hover={{
          bg: isActive ? 'contexta.600' : 'contextaDark.800',
          color: isActive ? 'white' : 'contexta.400',
        }}
        transition="all 0.2s"
        justify={isCollapsed ? 'center' : 'flex-start'}
        minH="48px"
      >
        <Icon as={icon} boxSize={5} />
        {!isCollapsed && (
          <Text fontWeight={isActive ? 'semibold' : 'normal'}>{children}</Text>
        )}
      </HStack>
    </Link>
  );
};

const SidebarContent = ({ onClose, isCollapsed, onToggle }: { 
  onClose?: () => void; 
  isCollapsed?: boolean;
  onToggle?: () => void;
}) => {
  return (
    <Box
      w={isCollapsed ? "80px" : "250px"}
      h="full"
      className="bg-gradient-secondary"
      borderRight="1px"
      borderColor="contextaDark.800"
      py={6}
      px={isCollapsed ? 2 : 4}
      transition="all 0.3s ease"
    >
      <VStack gap={2} align="stretch">
        <HStack justify="space-between" mb={8}>
          {!isCollapsed && (
            <ContextaLogo size="lg" variant="solid" centered={false} />
          )}
          <IconButton
            aria-label="Toggle sidebar"
            size="sm"
            variant="ghost"
            color="gray.300"
            onClick={onToggle}
            _hover={{ bg: 'contextaDark.800', color: 'contexta.400' }}
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </IconButton>
        </HStack>
        
        <VStack gap={1} align="stretch">
          <NavItem icon={FiHome} to="/dashboard" onClose={onClose} isCollapsed={isCollapsed}>
            Dashboard
          </NavItem>
          <NavItem icon={FiSettings} to="/company" onClose={onClose} isCollapsed={isCollapsed}>
            Empresa
          </NavItem>
          <NavItem icon={FiMessageSquare} to="/chatbot" onClose={onClose} isCollapsed={isCollapsed}>
            Assistente
          </NavItem>
          <NavItem icon={SiWhatsapp} to="/whatsapp" onClose={onClose} isCollapsed={isCollapsed}>
            WhatsApp
          </NavItem>
          <NavItem icon={FiBarChart} to="/analytics" onClose={onClose} isCollapsed={isCollapsed}>
            Analytics
          </NavItem>
          <NavItem icon={FiCreditCard} to="/plans" onClose={onClose} isCollapsed={isCollapsed}>
            Planos
          </NavItem>
        </VStack>
      </VStack>
    </Box>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ onClose, isCollapsed, onToggle }) => {
  return (
    <SidebarContent onClose={onClose} isCollapsed={isCollapsed} onToggle={onToggle} />
  );
};