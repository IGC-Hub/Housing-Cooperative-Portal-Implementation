import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  Calendar,
  FileText,
  Users,
  CheckSquare,
  PlusCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  Search,
  Filter,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import type { Meeting, AgendaItem, Resolution } from '../types';

export function Governance() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'ag' | 'workspace'>('ag');
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // État pour le formulaire de point à l'ordre du jour
  const [agendaItemForm, setAgendaItemForm] = useState<Partial<AgendaItem>>({
    title: '',
    description: '',
    duration: 15,
    presenter: user?.firstName + ' ' + user?.lastName
  });

  // Exemple de données
  const [meetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Assemblée Générale Annuelle 2024',
      type: 'AG',
      date: '2024-03-15',
      startTime: '19:00',
      endTime: '21:00',
      location: 'Salle communautaire',
      agenda: [],
      attendees: [],
      documents: [
        {
          id: '1',
          title: 'Rapport financier 2023',
          description: 'États financiers annuels',
          url: '#',
          category: 'Finance',
          created_at: '2024-02-01',
          created_by: 'Trésorier'
        }
      ],
      status: 'upcoming'
    }
  ]);

  const [resolutions] = useState<Resolution[]>([
    {
      id: '1',
      meetingId: '1',
      title: 'Adoption du budget 2024',
      description: 'Budget prévisionnel pour l\'année 2024',
      proposedBy: 'Jean Martin',
      secondedBy: 'Marie Dubois',
      votesFor: 15,
      votesAgainst: 2,
      votesAbstain: 1,
      status: 'adopted',
      date: '2024-01-15'
    }
  ]);

  const handleAgendaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de soumission à implémenter
    setShowAgendaModal(false);
  };

  const handleRsvp = (attending: boolean) => {
    // Logique de RSVP à implémenter
    setShowRsvpModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Gouvernance</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('ag')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'ag'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Assemblées Générales
          </button>
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'workspace'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Espace CA
          </button>
        </div>
      </div>

      {activeTab === 'ag' && (
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {/* Prochaine AG */}
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Prochaine Assemblée Générale</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-500">
                    <Calendar className="inline-block h-4 w-4 mr-2" />
                    15 mars 2024, 19h00 - 21h00
                  </p>
                  <p className="text-sm text-gray-500">
                    <Users className="inline-block h-4 w-4 mr-2" />
                    Salle communautaire
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowAgendaModal(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Point à l'ordre du jour
                </button>
                <button
                  onClick={() => setShowRsvpModal(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  <CheckSquare className="h-5 w-5 mr-2" />
                  Confirmer ma présence
                </button>
              </div>
            </div>

            {/* Documents de l'AG */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">Documents disponibles</h4>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {meetings[0].documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                  >
                    <div className="flex-shrink-0">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href={doc.url} className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-sm text-gray-500 truncate">{doc.description}</p>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ordre du jour */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">Ordre du jour</h4>
              <div className="mt-2 space-y-4">
                {meetings[0].agenda.length > 0 ? (
                  meetings[0].agenda.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">{item.title}</h5>
                          <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span>
                              <Clock className="inline-block h-4 w-4 mr-1" />
                              {item.duration} min
                            </span>
                            <span>
                              <Users className="inline-block h-4 w-4 mr-1" />
                              {item.presenter}
                            </span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status === 'approved' ? 'Approuvé' : item.status === 'rejected' ? 'Refusé' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun point à l'ordre du jour</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Commencez par ajouter un point à l'ordre du jour.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historique des résolutions */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Résolutions adoptées</h3>
            <div className="mt-4 space-y-4">
              {resolutions.map((resolution) => (
                <div key={resolution.id} className="bg-white rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{resolution.title}</h4>
                      <p className="mt-1 text-sm text-gray-500">{resolution.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Proposée par: {resolution.proposedBy}</span>
                        <span>Appuyée par: {resolution.secondedBy}</span>
                        <span>Date: {resolution.date}</span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Pour: {resolution.votesFor}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Contre: {resolution.votesAgainst}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Abstention: {resolution.votesAbstain}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      resolution.status === 'adopted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {resolution.status === 'adopted' ? 'Adoptée' : 'Rejetée'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de point à l'ordre du jour */}
      {showAgendaModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Ajouter un point à l'ordre du jour
              </h3>
              <button
                onClick={() => setShowAgendaModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAgendaSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={agendaItemForm.title}
                  onChange={(e) => setAgendaItemForm({ ...agendaItemForm, title: e.target.value })}
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
                  required
                  value={agendaItemForm.description}
                  onChange={(e) => setAgendaItemForm({ ...agendaItemForm, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Durée estimée (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  min="5"
                  step="5"
                  required
                  value={agendaItemForm.duration}
                  onChange={(e) => setAgendaItemForm({ ...agendaItemForm, duration: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="presenter" className="block text-sm font-medium text-gray-700">
                  Présentateur
                </label>
                <input
                  type="text"
                  id="presenter"
                  required
                  value={agendaItemForm.presenter}
                  onChange={(e) => setAgendaItemForm({ ...agendaItemForm, presenter: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAgendaModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Soumettre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de présence */}
      {showRsvpModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Confirmer votre présence
              </h3>
              <button
                onClick={() => setShowRsvpModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Confirmez-vous votre présence à l'Assemblée Générale du 15 mars 2024 ?
              </p>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => handleRsvp(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Je ne participe pas
              </button>
              <button
                type="button"
                onClick={() => handleRsvp(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                Je participe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}