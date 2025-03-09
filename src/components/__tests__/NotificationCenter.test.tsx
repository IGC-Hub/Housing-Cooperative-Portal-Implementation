import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { NotificationCenter } from '../NotificationCenter';
import { useNotifications } from '../../hooks/useNotifications';

// Mock useNotifications hook
vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: vi.fn()
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('NotificationCenter', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'document',
      title: 'Test Notification',
      content: 'Test Content',
      read: false,
      created_at: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      error: null,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      deleteNotification: vi.fn()
    });
  });

  it('renders notification button with badge', () => {
    render(<NotificationCenter />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens notification panel on click', () => {
    render(<NotificationCenter />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
  });

  it('marks notification as read', async () => {
    const mockMarkAsRead = vi.fn();
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      error: null,
      markAsRead: mockMarkAsRead,
      markAllAsRead: vi.fn(),
      deleteNotification: vi.fn()
    });

    render(<NotificationCenter />);
    
    fireEvent.click(screen.getByRole('button'));
    const checkButton = screen.getByRole('button', { name: /marquer comme lu/i });
    fireEvent.click(checkButton);

    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('marks all notifications as read', async () => {
    const mockMarkAllAsRead = vi.fn();
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      error: null,
      markAsRead: vi.fn(),
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: vi.fn()
    });

    render(<NotificationCenter />);
    
    fireEvent.click(screen.getByRole('button'));
    const markAllButton = screen.getByText('Tout marquer comme lu');
    fireEvent.click(markAllButton);

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('deletes notification', async () => {
    const mockDeleteNotification = vi.fn();
    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      loading: false,
      error: null,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      deleteNotification: mockDeleteNotification
    });

    render(<NotificationCenter />);
    
    fireEvent.click(screen.getByRole('button'));
    const deleteButton = screen.getByRole('button', { name: /supprimer/i });
    fireEvent.click(deleteButton);

    expect(mockDeleteNotification).toHaveBeenCalledWith('1');
  });

  it('shows loading state', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: true,
      error: null,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      deleteNotification: vi.fn()
    });

    render(<NotificationCenter />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: 'Test error',
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      deleteNotification: vi.fn()
    });

    render(<NotificationCenter />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});