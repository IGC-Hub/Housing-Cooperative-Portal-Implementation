import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

// Utilisateur de test pour le développement
const devUser: User = {
  id: '00000000-0000-0000-0000-000000000000', // Valid UUID format
  email: 'dev@example.com',
  firstName: 'Jean',
  lastName: 'Développeur',
  role: 'admin',
  unit: 'A101',
  phone: '+1234567890',
  created_at: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set) => ({
  // Utilisateur de développement activé
  user: devUser,
  isAuthenticated: true,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));