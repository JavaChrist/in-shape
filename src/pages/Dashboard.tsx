import React from 'react';
import {
  ChartBarIcon,
  FireIcon,
  ScaleIcon,
  FlagIcon,
  TrophyIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/useAuthStore';

const Dashboard: React.FC = () => {
  const { user, isCoach } = useAuthStore();

  // Données de demo - à remplacer par de vraies données
  const stats = [
    {
      name: 'Poids actuel',
      value: '75.2 kg',
      change: '-2.3 kg',
      changeType: 'positive',
      icon: ScaleIcon,
    },
    {
      name: 'Objectif atteint',
      value: '68%',
      change: '+5%',
      changeType: 'positive',
      icon: FlagIcon,
    },
    {
      name: 'Séances cette semaine',
      value: '4',
      change: '+1',
      changeType: 'positive',
      icon: FireIcon,
    },
    {
      name: 'Streak nutrition',
      value: '12 jours',
      change: '+2',
      changeType: 'positive',
      icon: TrophyIcon,
    },
  ];

  const recentActivities = [
    { type: 'nutrition', description: 'Petit-déjeuner enregistré', time: '8h30' },
    { type: 'exercise', description: 'Séance pyramide terminée', time: '7h15' },
    { type: 'measurement', description: 'Poids mis à jour', time: 'Hier' },
    { type: 'goal', description: 'Objectif eau atteint', time: 'Hier' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isCoach() ? 'Dashboard Coach' : 'Mon Dashboard'}
          </h1>
          <p className="text-gray-600">
            Bonjour {user?.name} ! Voici votre progression aujourd'hui
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-primary-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">cette semaine</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Entry */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              <ChartBarIcon className="h-8 w-8 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-primary-900">Nutrition</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <FireIcon className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">Exercice</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <ScaleIcon className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Pesée</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <FlagIcon className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Objectifs</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${activity.type === 'nutrition' ? 'bg-primary-500' :
                  activity.type === 'exercise' ? 'bg-orange-500' :
                    activity.type === 'measurement' ? 'bg-green-500' :
                      'bg-purple-500'
                  }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression cette semaine</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Nutrition</span>
              <span className="text-sm text-gray-500">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Exercices</span>
              <span className="text-sm text-gray-500">70%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Hydratation</span>
              <span className="text-sm text-gray-500">95%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Sommeil</span>
              <span className="text-sm text-gray-500">80%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="card bg-gradient-to-r from-primary-500 to-blue-600 text-white">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">💡 Inspiration du jour</h3>
          <p className="text-primary-100 italic">
            "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte."
          </p>
          <p className="text-sm text-primary-200 mt-2">- Winston Churchill</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 