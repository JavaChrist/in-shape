import React from 'react';

const CoachDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Coach</h1>
        <p className="text-gray-600">Vue d'ensemble de vos élèves</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">👨‍🏫 En cours de développement</h2>
        <p className="text-gray-600">
          Cette page permettra de voir un aperçu de tous vos élèves,
          leurs progressions et commentaires en attente.
        </p>
      </div>
    </div>
  );
};

export default CoachDashboard; 