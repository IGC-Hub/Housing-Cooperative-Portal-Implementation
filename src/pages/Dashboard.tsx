import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Bell,
  Calendar,
  CheckCircle2,
  FileText,
  Mail,
  MessageSquare,
  User,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  BookOpen,
  Settings,
  ChevronDown
} from 'lucide-react';

interface Notification {
  id: number;
  type: 'task' | 'meeting' | 'deadline' | 'sanction';
  title: string;
  description: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
}

interface Message {
  id: number;
  subject: string;
  department: string;
  content: string;
  date: string;
  read: boolean;
}

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
  const [messageSearch, setMessageSearch] = useState('');

  // État du membre
  const memberStatus = {
    status: 'actif',
    roles: ['Membre du CA', 'Comité Entretien'],
    lastStatusUpdate: '2024-02-15T14:30:00',
    memberSince: '2023-01-01'
  };

  // Notifications exemple
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'task',
      title: 'Inspection annuelle',
      description: 'Inspection de votre unité prévue',
      date: '2024-02-20',
      priority: 'high',
      read: false
    },
    {
      id: 2,
      type: 'meeting',
      title: 'Assemblée Générale',
      description: 'Assemblée générale annuelle',
      date: '2024-02-25',
      priority: 'medium',
      read: false
    },
    {
      id: 3,
      type: 'deadline',
      title: 'Paiement mensuel',
      description: 'Date limite du paiement mensuel',
      date: '2024-02-28',
      priority: 'high',
      read: true
    }
  ]);

  // Messages exemple
  const [messages] = useState<Message[]>([
    {
      id: 1,
      subject: 'Confirmation inspection',
      department: 'Entretien',
      content: 'Confirmation de la date d\'inspection...',
      date: '2024-02-15',
      read: false
    },
    {
      id: 2,
      subject: 'Rappel assemblée',
      department: 'Administration',
      content: 'Rappel concernant l\'assemblée générale...',
      date: '2024-02-14',
      read: true
    }
  ]);

  // Accès rapides
  const quickAccess = [
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: Calendar, label: 'Calendrier', path: '/calendar' },
    { icon: BookOpen, label: 'Guide', path: '/guide' },
    { icon: Settings, label: 'Paramètres', path: '/settings' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'actif':
        return 'text-green-600 bg-green-50';
      case 'suspendu':
        return 'text-yellow-600 bg-yellow-50';
      case 'exclu':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => 
    notificationFilter === 'all' || !notification.read
  );

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(messageSearch.toLowerCase()) ||
    message.department.toLowerCase().includes(messageSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* En-tête avec statut du membre */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(memberStatus.status)}`}>
                    {memberStatus.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    Membre depuis {new Date(memberStatus.memberSince).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Dernière mise à jour du statut</div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {new Date(memberStatus.lastStatusUpdate).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Rôles actuels</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {memberStatus.roles.map((role, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu d'accès rapide */}
      <div className="grid grid-cols-4 gap-4">
        {quickAccess.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
          >
            <item.icon className="h-6 w-6 text-indigo-600" />
            <span className="mt-2 text-sm font-medium text-gray-900">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Centre de notifications et messagerie */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 ${
                activeTab === 'messages'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Messages</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'notifications' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={notificationFilter}
                    onChange={(e) => setNotificationFilter(e.target.value as 'all' | 'unread')}
                    className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">Toutes</option>
                    <option value="unread">Non lues</option>
                  </select>
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${notification.read ? 'bg-white' : 'bg-indigo-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {notification.type === 'task' && <CheckCircle2 className="h-5 w-5 text-indigo-500" />}
                        {notification.type === 'meeting' && <Calendar className="h-5 w-5 text-indigo-500" />}
                        {notification.type === 'deadline' && <Clock className="h-5 w-5 text-indigo-500" />}
                        {notification.type === 'sanction' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          <p className="mt-1 text-sm text-gray-500">{notification.description}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{notification.date}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Messages</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 pl-10"
                  />
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border ${message.read ? 'bg-white' : 'bg-indigo-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-5 w-5 text-indigo-500" />
                          <h4 className="text-sm font-medium text-gray-900">{message.subject}</h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {message.department}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{message.content}</p>
                        <div className="mt-2 text-xs text-gray-500">{message.date}</div>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-800">
                        <ChevronDown className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}