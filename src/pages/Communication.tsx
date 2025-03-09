import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  Bell,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Search,
  HelpCircle,
  Plus,
  ThumbsUp,
  Flag,
  Edit,
  Lock,
  Pin,
  Filter,
  Tag,
  Eye
} from 'lucide-react';
import type {
  Announcement,
  FAQItem,
  FAQCategory,
  ForumTopic,
  ForumCategory,
  AnnouncementPriority
} from '../types';

export function Communication() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'announcements' | 'faq' | 'forum'>('announcements');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewAnnouncementModal, setShowNewAnnouncementModal] = useState(false);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [showFAQSuggestionModal, setShowFAQSuggestionModal] = useState(false);

  // Données exemple
  const [announcements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Maintenance d\'urgence - Système de chauffage',
      content: 'Une intervention urgente est prévue demain à 9h pour réparer le système de chauffage central.',
      priority: 'urgent',
      category: 'maintenance',
      created_at: new Date().toISOString(),
      created_by: 'Admin',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      acknowledgment_required: true
    },
    {
      id: '2',
      title: 'Rappel : Assemblée générale',
      content: 'L\'assemblée générale annuelle aura lieu le 15 mars à 19h dans la salle communautaire.',
      priority: 'high',
      category: 'event',
      created_at: new Date().toISOString(),
      created_by: 'Admin'
    }
  ]);

  const [faqCategories] = useState<FAQCategory[]>([
    {
      id: '1',
      name: 'Règlements intérieurs',
      description: 'Tout savoir sur les règles de vie en communauté',
      order: 1
    },
    {
      id: '2',
      name: 'Responsabilités des membres',
      description: 'Comprendre vos droits et devoirs',
      order: 2
    }
  ]);

  const [faqItems] = useState<FAQItem[]>([
    {
      id: '1',
      category_id: '1',
      question: 'Quelles sont les heures de silence à respecter ?',
      answer: 'Le silence doit être respecté entre 22h et 7h du lundi au dimanche.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: 'Admin',
      status: 'published',
      votes: 12,
      tags: ['règlement', 'bruit']
    }
  ]);

  const [forumCategories] = useState<ForumCategory[]>([
    {
      id: '1',
      name: 'Vie commune',
      description: 'Discussions sur la vie quotidienne dans la coopérative',
      order: 1,
      moderators: ['admin1', 'admin2']
    },
    {
      id: '2',
      name: 'Projets',
      description: 'Propositions et discussions sur les projets communautaires',
      order: 2,
      moderators: ['admin1']
    }
  ]);

  const getPriorityColor = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Annonces prioritaires</h3>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowNewAnnouncementModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle annonce
          </button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`p-4 rounded-lg border ${getPriorityColor(announcement.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {announcement.priority === 'urgent' && (
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <h4 className="text-lg font-medium">{announcement.title}</h4>
                  <p className="mt-1 text-sm">{announcement.content}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </span>
                    {announcement.expires_at && (
                      <span className="flex items-center text-red-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Expire le {new Date(announcement.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {announcement.acknowledgment_required && (
                <button className="flex items-center px-3 py-1 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Confirmer lecture
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">FAQ</h3>
        <button
          onClick={() => setShowFAQSuggestionModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <HelpCircle className="h-5 w-5 mr-2" />
          Suggérer une question
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faqCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
              <p className="mt-1 text-sm text-gray-500">{category.description}</p>
              <div className="mt-4 space-y-4">
                {faqItems
                  .filter((item) => item.category_id === category.id)
                  .map((item) => (
                    <div key={item.id} className="border-t pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-base font-medium text-gray-900">{item.question}</h5>
                          <p className="mt-2 text-sm text-gray-500">{item.answer}</p>
                          <div className="mt-2 flex items-center space-x-4">
                            <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {item.votes}
                            </button>
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderForum = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Forum de discussion</h3>
        <button
          onClick={() => setShowNewTopicModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Nouveau sujet
        </button>
      </div>

      <div className="space-y-6">
        {forumCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
              <p className="mt-1 text-sm text-gray-500">{category.description}</p>
            </div>
            <div className="divide-y divide-gray-200">
              {/* Exemple de sujets */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Pin className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h5 className="text-base font-medium text-gray-900">
                        Bienvenue sur le forum
                      </h5>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          15 réponses
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          45 vues
                        </span>
                        <span>
                          Dernier message par Admin le {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Communication</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'announcements'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Annonces
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'faq'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('forum')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'forum'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Forum
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <input
            type="text"
            placeholder={`Rechercher dans ${
              activeTab === 'announcements'
                ? 'les annonces'
                : activeTab === 'faq'
                ? 'la FAQ'
                : 'le forum'
            }...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'announcements' && renderAnnouncements()}
        {activeTab === 'faq' && renderFAQ()}
        {activeTab === 'forum' && renderForum()}
      </div>
    </div>
  );
}