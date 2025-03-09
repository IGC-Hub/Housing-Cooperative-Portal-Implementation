import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  PlusCircle,
  CheckCircle2,
  Clock,
  User,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Camera,
  AlertTriangle,
  Building,
  BarChart
} from 'lucide-react';
import type { Task } from '../types';

interface CalendarView {
  type: 'month' | 'week' | 'day';
  date: Date;
}

export function Tasks() {
  const user = useAuthStore((state) => state.user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>({
    type: 'month',
    date: new Date()
  });
  const [filters, setFilters] = useState({
    floor: 'all',
    member: 'all',
    status: 'all'
  });

  // État pour la validation des tâches
  const [validationForm, setValidationForm] = useState({
    photo: null as File | null,
    comment: '',
    timestamp: new Date().toISOString()
  });

  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Nettoyage des escaliers',
      description: 'Nettoyage hebdomadaire des escaliers communs',
      assignedTo: [user?.id || ''],
      dueDate: '2024-02-20',
      status: 'pending',
      created_at: '2024-02-15',
      floor: '1',
      completionProof: undefined
    },
    {
      id: '2',
      title: 'Inspection des extincteurs',
      description: 'Vérification mensuelle des extincteurs',
      assignedTo: [user?.id || ''],
      dueDate: '2024-02-25',
      status: 'in_progress',
      created_at: '2024-02-15',
      floor: '2',
      completionProof: undefined
    }
  ]);

  const handleValidationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    if (validationForm.comment.length < 20) {
      alert('Le commentaire doit contenir au moins 20 caractères');
      return;
    }

    if (!validationForm.photo) {
      alert('Une photo est requise pour la validation');
      return;
    }

    // Logique de validation à implémenter
    setShowValidationModal(false);
    setValidationForm({
      photo: null,
      comment: '',
      timestamp: new Date().toISOString()
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setValidationForm({ ...validationForm, photo: e.target.files[0] });
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'non_compliant':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCalendarView({ ...calendarView, type: 'month' })}
          className={`px-3 py-1 rounded-md ${
            calendarView.type === 'month' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'
          }`}
        >
          Mois
        </button>
        <button
          onClick={() => setCalendarView({ ...calendarView, type: 'week' })}
          className={`px-3 py-1 rounded-md ${
            calendarView.type === 'week' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'
          }`}
        >
          Semaine
        </button>
        <button
          onClick={() => setCalendarView({ ...calendarView, type: 'day' })}
          className={`px-3 py-1 rounded-md ${
            calendarView.type === 'day' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'
          }`}
        >
          Jour
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-1 rounded-md hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-lg font-medium">
          {calendarView.date.toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
          })}
        </span>
        <button className="p-1 rounded-md hover:bg-gray-100">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="flex items-center space-x-4 mb-4">
      <div className="flex items-center space-x-2">
        <Building className="h-5 w-5 text-gray-400" />
        <select
          value={filters.floor}
          onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="all">Tous les étages</option>
          <option value="1">1er étage</option>
          <option value="2">2e étage</option>
          <option value="3">3e étage</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <User className="h-5 w-5 text-gray-400" />
        <select
          value={filters.member}
          onChange={(e) => setFilters({ ...filters, member: e.target.value })}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="all">Tous les membres</option>
          <option value="me">Mes tâches</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <Filter className="h-5 w-5 text-gray-400" />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">À faire</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminé</option>
          <option value="overdue">En retard</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Gestion des tâches</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {/* Implémenter la génération de rapport */}}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <BarChart className="h-5 w-5 mr-2" />
            Rapport
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Nouvelle tâche
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {renderCalendarHeader()}
        {renderFilters()}

        <div className="mt-6 space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${getStatusColor(task.status)}`}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        Étage {task.floor}
                      </div>
                      {task.completionProof && (
                        <div className="flex items-center text-green-600">
                          <Camera className="h-4 w-4 mr-1" />
                          Validé
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowValidationModal(true);
                  }}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Valider
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de validation */}
      {showValidationModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Validation de la tâche
              </h3>
              <button
                onClick={() => setShowValidationModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleValidationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Photo de la tâche
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="photo-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Téléverser une photo</span>
                        <input
                          id="photo-upload"
                          name="photo-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handlePhotoChange}
                          required
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG jusqu'à 10MB
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                  Commentaire (minimum 20 caractères)
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  required
                  minLength={20}
                  value={validationForm.comment}
                  onChange={(e) => setValidationForm({ ...validationForm, comment: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Décrivez comment vous avez accompli la tâche..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  {validationForm.comment.length}/20 caractères minimum
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowValidationModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Valider la tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}