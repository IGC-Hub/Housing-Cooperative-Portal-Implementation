import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  useForumCategories,
  useForumTopics,
  useForumReplies,
  useForumActions
} from '../hooks/useForum';
import {
  MessageSquare,
  Plus,
  Flag,
  ThumbsUp,
  Edit,
  Lock,
  Pin,
  Tag,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  User,
  Reply,
  MoreVertical,
  Loader
} from 'lucide-react';
import type { ForumCategory, ForumTopic, ForumReply } from '../types';

export function Forum() {
  const user = useAuthStore((state) => state.user);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');

  const { categories, loading: loadingCategories } = useForumCategories();
  const { topics, loading: loadingTopics } = useForumTopics(selectedCategory ?? undefined);
  const { replies, loading: loadingReplies } = useForumReplies(selectedTopic?.id ?? '');
  const { createTopic, createReply, reportContent } = useForumActions();

  const [newTopicForm, setNewTopicForm] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });

  const [newReplyForm, setNewReplyForm] = useState({
    content: '',
    parentId: null as string | null
  });

  const [reportForm, setReportForm] = useState({
    contentType: 'topic' as 'topic' | 'reply',
    contentId: '',
    reason: ''
  });

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      await createTopic(
        selectedCategory,
        newTopicForm.title,
        newTopicForm.content,
        newTopicForm.tags
      );
      setShowNewTopicModal(false);
      setNewTopicForm({ title: '', content: '', tags: [] });
    } catch (error) {
      console.error('Failed to create topic:', error);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;

    try {
      await createReply(
        selectedTopic.id,
        newReplyForm.content,
        newReplyForm.parentId
      );
      setNewReplyForm({ content: '', parentId: null });
    } catch (error) {
      console.error('Failed to create reply:', error);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reportContent(
        reportForm.contentType,
        reportForm.contentId,
        reportForm.reason
      );
      setShowReportModal(false);
      setReportForm({ contentType: 'topic', contentId: '', reason: '' });
    } catch (error) {
      console.error('Failed to report content:', error);
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || topic.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Forum de discussion</h2>
        <button
          onClick={() => setShowNewTopicModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau sujet
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher dans le forum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'closed')}
            className="border rounded-md py-2 pl-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="open">Ouverts</option>
            <option value="closed">Fermés</option>
          </select>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-12 gap-6">
        {/* Liste des catégories */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Catégories</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {loadingCategories ? (
                <div className="p-4 flex justify-center">
                  <Loader className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 ${
                      selectedCategory === category.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="mt-1 text-sm text-gray-500">{category.description}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Liste des sujets ou réponses */}
        <div className="col-span-9">
          {selectedTopic ? (
            <div className="bg-white rounded-lg shadow">
              {/* En-tête du sujet */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{selectedTopic.title}</h3>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {selectedTopic.created_by}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(selectedTopic.created_at).toLocaleDateString()}
                      </span>
                      {selectedTopic.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Retour</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 text-gray-700">{selectedTopic.content}</div>
              </div>

              {/* Liste des réponses */}
              <div className="divide-y divide-gray-200">
                {loadingReplies ? (
                  <div className="p-6 flex justify-center">
                    <Loader className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  replies.map((reply) => (
                    <div key={reply.id} className="p-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {reply.created_by}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(reply.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setReportForm({
                                    contentType: 'reply',
                                    contentId: reply.id,
                                    reason: ''
                                  });
                                  setShowReportModal(true);
                                }}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <Flag className="h-5 w-5" />
                              </button>
                              {reply.created_by === user?.id && (
                                <button className="text-gray-400 hover:text-gray-500">
                                  <Edit className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 text-gray-700">{reply.content}</div>
                          <div className="mt-2 flex items-center space-x-4">
                            <button className="flex items-center text-gray-400 hover:text-gray-500">
                              <ThumbsUp className="h-5 w-5 mr-1" />
                              {reply.likes}
                            </button>
                            <button
                              onClick={() => setNewReplyForm({ ...newReplyForm, parentId: reply.id })}
                              className="flex items-center text-gray-400 hover:text-gray-500"
                            >
                              <Reply className="h-5 w-5 mr-1" />
                              Répondre
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Formulaire de réponse */}
              <div className="p-6 border-t">
                <form onSubmit={handleCreateReply}>
                  <div>
                    <label htmlFor="reply" className="sr-only">
                      Votre réponse
                    </label>
                    <textarea
                      id="reply"
                      rows={3}
                      value={newReplyForm.content}
                      onChange={(e) => setNewReplyForm({ ...newReplyForm, content: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Écrivez votre réponse..."
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Répondre
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
              {loadingTopics ? (
                <div className="p-6 flex justify-center">
                  <Loader className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : (
                filteredTopics.map((topic) => (
                  <div key={topic.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <button
                          onClick={() => setSelectedTopic(topic)}
                          className="text-left group"
                        >
                          <h4 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                            {topic.title}
                          </h4>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {topic.created_by}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(topic.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {topic.replies?.length ?? 0} réponses
                            </span>
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {topic.views} vues
                            </span>
                          </div>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        {topic.pinned && (
                          <Pin className="h-5 w-5 text-indigo-600" />
                        )}
                        {topic.status === 'closed' && (
                          <Lock className="h-5 w-5 text-gray-400" />
                        )}
                        <button
                          onClick={() => {
                            setReportForm({
                              contentType: 'topic',
                              contentId: topic.id,
                              reason: ''
                            });
                            setShowReportModal(true);
                          }}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Flag className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création de sujet */}
      {showNewTopicModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Nouveau sujet
              </h3>
              <button
                onClick={() => setShowNewTopicModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={newTopicForm.title}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Contenu
                </label>
                <textarea
                  id="content"
                  rows={6}
                  required
                  value={newTopicForm.content}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, content: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={newTopicForm.tags.join(', ')}
                  onChange={(e) => setNewTopicForm({
                    ...newTopicForm,
                    tags: e.target.value.split(',').map(tag => tag.trim())
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewTopicModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de signalement */}
      {showReportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Signaler un contenu
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Raison du signalement
                </label>
                <textarea
                  id="reason"
                  rows={4}
                  required
                  value={reportForm.reason}
                  onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Expliquez pourquoi vous signalez ce contenu..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Signaler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}