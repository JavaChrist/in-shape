import React from 'react';

const Goals: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Objectifs</h1>
        <p className="text-gray-600">Gérez vos objectifs hebdomadaires</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 En cours de développement</h2>
        <p className="text-gray-600">
          Cette page permettra de gérer vos objectifs hebdomadaires avec des cases à cocher,
          comme dans votre tableau de suivi.
        </p>
      </div>
    </div>
  );
};

export default Goals; 