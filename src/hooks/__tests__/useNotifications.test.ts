import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useNotifications } from '../useNotifications';
import { supabase } from '../../lib/supabase';

// Mock useAuthStore
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 'test-user' }
  }))
}));

describe('useNotifications', () => {
  const mockNotifications = [
    {
      id: '1',
      user_id: 'test-user',
      type: 'document',
      title: 'Test Notification',
      content: 'Test Content',
      read: false,
      created_at: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads notifications successfully', async () => {
    vi.spyOn(supabase, 'from').mockImplementationOnce(() => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: mockNotifications, error: null })
        })
      })
    }));

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.unreadCount).toBe(1);
  });

  it('marks notification as read', async () => {
    vi.spyOn(supabase, 'from').mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: mockNotifications, error: null })
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    }));

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.markAsRead('1');
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('marks all notifications as read', async () => {
    vi.spyOn(supabase, 'from').mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: mockNotifications, error: null })
        })
      }),
      update: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        })
      })
    }));

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(result.current.notifications.every(n => n.read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('deletes notification', async () => {
    vi.spyOn(supabase, 'from').mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: mockNotifications, error: null })
        })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    }));

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.deleteNotification('1');
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('handles errors', async () => {
    vi.spyOn(supabase, 'from').mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: null, error: new Error('Test error') })
        })
      })
    }));

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeTruthy();
  });
});