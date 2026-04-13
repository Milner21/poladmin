// contexts/AuthContext.ts

import { createContext } from 'react';
import { type AuthContextType } from '@dto/auth.context.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);