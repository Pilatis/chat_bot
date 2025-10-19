import { useContext } from 'react';
import { ApiContext } from '../context/api.context';
import { ApiContextType } from '../types/api.types';

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);

  return context;
};

