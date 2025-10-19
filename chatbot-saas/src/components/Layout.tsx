import React, { useState } from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { onOpen, onClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex">
      <Box
        position="fixed"
        top={0}
        left={0}
        h="100vh"
        zIndex={1000}
        display={{ base: 'none', md: 'block' }}
      >
        <Sidebar 
          onClose={onClose} 
          isCollapsed={isCollapsed}
          onToggle={toggleSidebar}
        />
      </Box>
      <Box 
        flex="1" 
        ml={{ base: 0, md: isCollapsed ? '80px' : '250px' }} 
        transition="margin-left 0.3s ease"
        minH="100vh"
      >
        <Navbar onOpen={onOpen} />
        <Box p={6}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

