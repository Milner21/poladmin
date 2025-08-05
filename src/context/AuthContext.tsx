import { createContext } from 'react';
import type { AuthContextType } from '@interfaces/AuthContextType';

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true });