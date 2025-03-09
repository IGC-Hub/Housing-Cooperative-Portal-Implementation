import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
}

export function Calendar() {
  const user = useAuthStore((state) => state.user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: 'Assemblée générale',
      description: 'Réunion annuelle des membres',
      date: '2024-02-25',
      time: '19:00',
      location: 'Salle communautaire',
      organizer: 'Jean Développeur'
    },
    {
      id: 2,
      title: 'Entretien du jardin',
      description: 'Nettoyage de printemps',
      date: '2024-02-18',
      time: '10:00',
      location: 'Jardin communautaire',
      organizer: 'Marie Martin'
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    organizer: user?.firstName + ' ' + user?.lastName
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const event: Event = {
      id: events.length + 1,
      ...newEvent
    };
    setEvents([...events, event]);
    setShowCreateModal(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      organizer: user?.firstName + ' ' + user?.lastName
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Calendrier</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Ajouter un événement
        </button>
      </div>

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {event.date} à {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Organisé par: {event.organizer}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun événement</h3>
            <p className="mt-1 text-sm text-gray-500">Commencez par créer un nouvel événement.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Créer un nouvel événement</h3>
            <form onSubmit={handleCreateEvent}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Titre
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
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
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      required
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                      Heure
                    </label>
                    <input
                      type="time"
                      id="time"
                      required
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Lieu
                  </label>
                  <input
                    type="text"
                    id="location"
                    required
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
    </div>
  );
}