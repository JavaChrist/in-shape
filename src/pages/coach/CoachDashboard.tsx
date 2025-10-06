import React, { useState, useEffect } from 'react';
import { KeyIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/useAuthStore';

const CoachDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [coachCode, setCoachCode] = useState<string>('');
  const [studentCount, setStudentCount] = useState<number>(0);

  useEffect(() => {
    const loadCoachData = async () => {
      if (!user?.id || user.role !== 'coach') return;

      try {
        const coachDoc = await getDoc(doc(db, 'users', user.id));
        if (coachDoc.exists()) {
          const coachData = coachDoc.data();
          setCoachCode(coachData.coachCode || 'Non généré');
          setStudentCount((coachData.students || []).length);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données coach:', error);
      }
    };

    loadCoachData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Coach</h1>
        <p className="text-gray-600">Vue d'ensemble de vos élèves</p>
      </div>

      {/* Code coach */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-center mb-4">
          <KeyIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-blue-900">Votre code coach</h2>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-3 tracking-wider">{coachCode}</div>
          <p className="text-sm text-blue-700 mb-2">
            Partagez ce code avec vos élèves pour qu'ils puissent s'inscrire
          </p>
          <div className="bg-white p-3 rounded border border-blue-300">
            <p className="text-xs text-blue-800 font-medium">
              Instructions pour vos élèves : Lors de l'inscription, sélectionner "Élève" puis saisir ce code dans le champ "Code du coach"
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mes élèves</h3>
              <p className="text-3xl font-bold text-green-600">{studentCount}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Actions rapides</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              Voir tous mes élèves
            </button>
            <button className="w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              Consulter les données nutrition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard; 