// hooks/useAuth.ts

import { useContext } from 'react';
import { AuthContext } from '@context/AuthContext';
import { type AuthContextType } from '@dto/auth.context.types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};