import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { NotificationCenter } from './NotificationCenter';

export function Header() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Coopérative d'Habitation Portal
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Settings className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user?.firstName?.[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}