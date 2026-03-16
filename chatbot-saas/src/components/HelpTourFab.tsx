'use client';

import React, { useCallback } from 'react';
import { Box, IconButton } from '@chakra-ui/react';
import { FiHelpCircle } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { Tooltip } from '@/components/ui/tooltip';
import { buildTourSteps } from '@/utils/guidedTour';


interface IntroStep {
  element?: HTMLElement | string | null;
  title: string;
  intro: string;
  position?: string;
  scrollTo?: string;
}

interface HelpTourFabProps {
  mainContentRef: React.RefObject<HTMLElement | null>;
}

export function HelpTourFab({ mainContentRef }: HelpTourFabProps) {
  const pathname = usePathname();

  const startTour = useCallback(() => {
    const container = mainContentRef.current;
    const stepsInput = buildTourSteps(container, pathname ?? '');

    if (stepsInput.length === 0) return;

    // Dynamic import to avoid SSR issues and keep bundle smaller
    import('intro.js').then((introJsModule) => {
      const introJs = introJsModule.default;
      const steps = stepsInput.map((s, i) => {
        const step: Record<string, unknown> = {
          step: i + 1,
          title: s.title,
          intro: s.intro,
        };
        if (s.element) {
          step.element = s.element;
          step.position = 'bottom';
          step.scrollTo = 'element';
        } else {
          step.position = 'floating';
          step.scrollTo = 'off';
        }
        return step;
      });

      const tour = introJs.tour(container || undefined);
      tour
        .setOptions({
          nextLabel: 'Próximo',
          prevLabel: 'Anterior',
          skipLabel: 'X',
          doneLabel: 'Concluir',
          exitOnOverlayClick: true,

        })
        .addSteps(steps as any)
        .start();
    });
  }, [mainContentRef, pathname]);

  return (
    <Box
      position="fixed"
      bottom={6}
      right={6}
      zIndex={999}
    >
      <Tooltip content="Ajuda guiada" showArrow>
        <IconButton
          aria-label="Ajuda guiada"
          size="lg"
          borderRadius="full"
          bg="contexta.500"
          color="white"
          _hover={{ bg: 'contexta.600' }}
          onClick={startTour}
        >
          <FiHelpCircle size={24} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
