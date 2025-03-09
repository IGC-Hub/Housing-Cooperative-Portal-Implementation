import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface Notification {
  id: string;
  user_id: string;
  type: 'document' | 'task' | 'meeting' | 'forum' | 'announcement';
  title: string;
  content: string;
  link?: string;
  read: boolean;
  created_at: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export function useNotifications() {
  const user = useAuthStore(state => state.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Charger les notifications initiales
    const loadNotifications = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.read).length || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement des notifications');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // S'abonner aux nouvelles notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(current => [payload.new as Notification, ...current]);
        setUnreadCount(count => count + 1);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(current =>
          current.map(n =>
            n.id === payload.new.id ? (payload.new as Notification) : n
          )
        );
        // Mettre à jour le compteur de non lus
        setUnreadCount(current =>
          notifications.reduce(
            (count, n) => count + (n.id === payload.new.id ? 0 : !n.read ? 1 : 0),
            0
          )
        );
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      setNotifications(current =>
        current.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(count => Math.max(0, count - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage comme lu');
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (updateError) throw updateError;

      setNotifications(current =>
        current.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage comme lu');
      throw err;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (deleteError) throw deleteError;

      setNotifications(current =>
        current.filter(n => n.id !== notificationId)
      );
      setUnreadCount(count =>
        notifications.find(n => n.id === notificationId)?.read ? count : count - 1
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}