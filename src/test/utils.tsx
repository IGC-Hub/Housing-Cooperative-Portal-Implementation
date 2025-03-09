import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis()
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn()
      }))
    }
  }
}));

// Custom render with providers
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }: PropsWithChildren) => (
      <BrowserRouter>{children}</BrowserRouter>
    )
  });
}