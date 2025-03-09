import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  Trash2,
  X,
  AlertTriangle,
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationCenter() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'meeting':
        return Calendar;
      case 'forum':
        return MessageSquare;
      case 'task':
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const handleNotificationClick = async (notification: {
    id: string;
    link?: string;
    read: boolean;
  }) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <span className="sr-only">Notifications</span>
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Tout marquer comme lu
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-md bg-red-50">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Aucune notification
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start p-4 rounded-lg ${
                        !notification.read ? 'bg-indigo-50' : 'bg-white'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <Icon className={`h-6 w-6 ${
                          !notification.read ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-indigo-900' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-indigo-600 hover:text-indigo-500"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {notification.content}
                        </p>
                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}