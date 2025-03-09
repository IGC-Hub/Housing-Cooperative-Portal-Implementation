import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  PlusCircle,
  FileText,
  FolderOpen,
  Download,
  Upload,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  File,
  FileSignature,
  History,
  Settings
} from 'lucide-react';
import type { Document, Form, FormSubmission } from '../types';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
}

export function Documents() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'documents' | 'forms'>('documents');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const categories: Category[] = [
    { id: 'regulations', name: 'Règlements', icon: FileText },
    { id: 'contracts', name: 'Contrats', icon: FileSignature },
    { id: 'policies', name: 'Politiques', icon: File },
    { id: 'minutes', name: 'Procès-verbaux', icon: History },
    { id: 'reports', name: 'Rapports', icon: FileText },
    { id: 'other', name: 'Autres', icon: FolderOpen }
  ];

  const [documents] = useState<Document[]>([
    {
      id: '1',
      title: 'Règlements généraux 2024',
      description: 'Version officielle des règlements généraux',
      url: '#',
      category: 'regulations',
      type: 'official',
      version: '1.0.0',
      status: 'active',
      created_at: '2024-01-01',
      created_by: 'Admin',
      updated_at: '2024-01-01',
      updated_by: 'Admin',
      requires_signature: true
    },
    {
      id: '2',
      title: 'Contrat de membre',
      description: 'Contrat d\'adhésion standard',
      url: '#',
      category: 'contracts',
      type: 'template',
      version: '2.1.0',
      status: 'active',
      created_at: '2024-01-15',
      created_by: 'Admin',
      updated_at: '2024-01-15',
      updated_by: 'Admin',
      requires_signature: true
    }
  ]);

  const [forms] = useState<Form[]>([
    {
      id: '1',
      title: 'Candidature au Conseil d\'Administration',
      description: 'Formulaire de candidature pour le CA',
      type: 'board_application',
      status: 'active',
      anonymous: false,
      fields: [],
      created_at: '2024-01-01',
      created_by: 'Admin',
      deadline: '2024-03-01'
    },
    {
      id: '2',
      title: 'Demande d\'absence',
      description: 'Formulaire de demande d\'absence aux réunions',
      type: 'absence_request',
      status: 'active',
      anonymous: false,
      fields: [],
      created_at: '2024-01-15',
      created_by: 'Admin'
    }
  ]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de téléversement à implémenter
    setShowUploadModal(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de soumission de formulaire à implémenter
    setShowFormModal(false);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Documents et Formulaires</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'documents'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'forms'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Formulaires
          </button>
          {activeTab === 'documents' ? (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Upload className="h-5 w-5 mr-2" />
              Téléverser
            </button>
          ) : (
            <button
              onClick={() => setShowFormModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Nouveau formulaire
            </button>
          )}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          {activeTab === 'documents' && (
            <div className="flex items-center space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded-md py-2 pl-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md py-2 pl-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Liste des documents */}
      {activeTab === 'documents' && (
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {doc.category === 'regulations' && <FileText className="h-6 w-6 text-blue-500" />}
                    {doc.category === 'contracts' && <FileSignature className="h-6 w-6 text-green-500" />}
                    {doc.category === 'policies' && <File className="h-6 w-6 text-purple-500" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{doc.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{doc.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <History className="h-4 w-4 mr-1" />
                        Version {doc.version}
                      </span>
                      {doc.requires_signature && (
                        <span className="flex items-center text-orange-600">
                          <FileSignature className="h-4 w-4 mr-1" />
                          Signature requise
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {/* Logique de téléchargement */}}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {/* Logique de paramètres */}}
                      className="p-2 text-gray-400 hover:text-gray-500"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Liste des formulaires */}
      {activeTab === 'forms' && (
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {filteredForms.map((form) => (
            <div key={form.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{form.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{form.description}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Créé le {new Date(form.created_at).toLocaleDateString()}
                    </span>
                    {form.deadline && (
                      <span className="flex items-center text-orange-600">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Date limite: {new Date(form.deadline).toLocaleDateString()}
                      </span>
                    )}
                    {form.anonymous && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Anonyme
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {/* Logique de remplissage de formulaire */}}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Remplir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de téléversement */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Téléverser un document
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Catégorie
                </label>
                <select
                  id="category"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Document
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Téléverser un fichier</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          required
                        />
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX jusqu'à 10MB
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  id="requires-signature"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="requires-signature" className="ml-2 block text-sm text-gray-900">
                  Signature électronique requise
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Téléverser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}