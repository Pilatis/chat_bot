import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  hover?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  delay = 0,
  hover = true 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay,
        ease: "easeOut" 
      }}
      whileHover={hover ? { 
        y: -4,
        transition: { duration: 0.2 }
      } : {}}
    >
      <Card hover={hover}>
        {children}
      </Card>
    </motion.div>
  );
};

