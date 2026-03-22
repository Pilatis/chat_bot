import type { IconType } from 'react-icons';
import { FiCheckCircle, FiClock, FiShield } from 'react-icons/fi';

export interface RegisterFeatureItem {
  icon: IconType;
  text: string;
}

export const REGISTER_FEATURES: RegisterFeatureItem[] = [
  { icon: FiCheckCircle, text: 'Configure em poucos minutos' },
  { icon: FiClock, text: 'Teste grátis por 14 dias' },
  { icon: FiShield, text: 'Seus dados seguros e protegidos' },
];
