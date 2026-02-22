'use client';

import React from 'react';
import { Dialog, CloseButton } from '@chakra-ui/react';

export interface ModalProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  footer: React.ReactNode;
  /** Uso controlado: exibir/ocultar o modal */
  open?: boolean;
  /** Uso controlado: chamado quando o modal deve fechar (ex.: overlay, CloseTrigger) */
  onOpenChange?: (open: boolean) => void;
  /** Tamanho do diálogo (sm, md, lg, full) */
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const Modal = ({
  children,
  title,
  description = '',
  footer,
  open,
  onOpenChange,
  size = 'md',
}: ModalProps) => {
  const isControlled = open !== undefined && onOpenChange !== undefined;

  return (
    <Dialog.Root
      size={size}
      placement="center"
      motionPreset="slide-in-bottom"
      open={isControlled ? open : undefined}
      onOpenChange={isControlled ? (e) => onOpenChange?.(e.open) : undefined}
    >
      {!isControlled && <Dialog.Trigger />}
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
            {isControlled && (
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" onClick={() => onOpenChange?.(false)} />
              </Dialog.CloseTrigger>
            )}
          </Dialog.Header>
          <Dialog.Body>{children}</Dialog.Body>
          <Dialog.Footer>{footer}</Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
