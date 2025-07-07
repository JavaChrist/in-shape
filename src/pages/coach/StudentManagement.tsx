import React from 'react';

const StudentManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Élèves</h1>
        <p className="text-gray-600">Gérez vos élèves et leurs programmes</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">👥 En cours de développement</h2>
        <p className="text-gray-600">
          Cette page permettra de gérer vos élèves, leur assigner des programmes,
          commenter leurs saisies et importer/exporter des données Excel.
        </p>
      </div>
    </div>
  );
};

export default StudentManagement; 