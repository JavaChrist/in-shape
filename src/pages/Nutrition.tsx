import React, { useState } from 'react';
import { CalendarIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface NutritionEntry {
  petitDejeuner: string;
  dejeuner: string;
  collation: string;
  diner: string;
  eauBoissons: string;
  alcool: string;
}

interface WeekData {
  nutrition: {
    lundi: NutritionEntry;
    mardi: NutritionEntry;
    mercredi: NutritionEntry;
    jeudi: NutritionEntry;
    vendredi: NutritionEntry;
    samedi: NutritionEntry;
    dimanche: NutritionEntry;
  };
  sommeil: {
    lundi: string;
    mardi: string;
    mercredi: string;
    jeudi: string;
    vendredi: string;
    samedi: string;
    dimanche: string;
  };
}

const Nutrition: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weekData, setWeekData] = useState<{ [week: number]: WeekData }>({});

  const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const joursLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const categoriesNutrition = [
    { key: 'petitDejeuner', label: 'Petit déjeuner', color: 'bg-yellow-50 border-yellow-200' },
    { key: 'dejeuner', label: 'Déjeuner', color: 'bg-green-50 border-green-200' },
    { key: 'collation', label: 'Collation', color: 'bg-blue-50 border-blue-200' },
    { key: 'diner', label: 'Dîner', color: 'bg-purple-50 border-purple-200' },
    { key: 'eauBoissons', label: 'Eau & Boissons', color: 'bg-cyan-50 border-cyan-200' },
    { key: 'alcool', label: 'Alcool', color: 'bg-red-50 border-red-200' }
  ];

  const getWeekData = (week: number): WeekData => {
    if (!weekData[week]) {
      const emptyNutritionEntry: NutritionEntry = {
        petitDejeuner: '',
        dejeuner: '',
        collation: '',
        diner: '',
        eauBoissons: '',
        alcool: ''
      };

      return {
        nutrition: {
          lundi: { ...emptyNutritionEntry },
          mardi: { ...emptyNutritionEntry },
          mercredi: { ...emptyNutritionEntry },
          jeudi: { ...emptyNutritionEntry },
          vendredi: { ...emptyNutritionEntry },
          samedi: { ...emptyNutritionEntry },
          dimanche: { ...emptyNutritionEntry }
        },
        sommeil: {
          lundi: '',
          mardi: '',
          mercredi: '',
          jeudi: '',
          vendredi: '',
          samedi: '',
          dimanche: ''
        }
      };
    }
    return weekData[week];
  };

  const updateNutritionEntry = (week: number, jour: string, categorie: string, value: string) => {
    setWeekData(prev => {
      const currentData = getWeekData(week);
      const currentJourData = currentData.nutrition[jour as keyof typeof currentData.nutrition];

      return {
        ...prev,
        [week]: {
          ...currentData,
          nutrition: {
            ...currentData.nutrition,
            [jour]: {
              ...currentJourData,
              [categorie]: value
            }
          }
        }
      };
    });
  };

  const updateSommeilEntry = (week: number, jour: string, value: string) => {
    setWeekData(prev => {
      const currentData = getWeekData(week);

      return {
        ...prev,
        [week]: {
          ...currentData,
          sommeil: {
            ...currentData.sommeil,
            [jour]: value
          }
        }
      };
    });
  };

  const currentWeekData = getWeekData(currentWeek);

  const getWeekDates = (weekNumber: number) => {
    const year = new Date().getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7;
    const startDate = new Date(firstDayOfYear.getTime() + daysOffset * 24 * 60 * 60 * 1000);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      dates.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suivi Nutrition & Sommeil</h1>
          <p className="text-gray-600">Tableau de suivi hebdomadaire - Semaine {currentWeek}/52</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4" />
          <span>Semaine {currentWeek}</span>
        </div>
      </div>

      {/* Navigation des semaines */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">📅 Navigation par semaines</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              className="btn-sm btn-secondary"
              disabled={currentWeek <= 0}
            >
              ← Semaine précédente
            </button>
            <select
              value={currentWeek}
              onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Array.from({ length: 53 }, (_, i) => (
                <option key={i} value={i}>
                  Semaine {i}
                </option>
              ))}
            </select>
            <button
              onClick={() => setCurrentWeek(Math.min(52, currentWeek + 1))}
              className="btn-sm btn-secondary"
              disabled={currentWeek >= 52}
            >
              Semaine suivante →
            </button>
          </div>
        </div>
      </div>

      {/* Tableau Nutrition */}
      <div className="card">
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🍽️</span>
            ALIMENTATION - Semaine {currentWeek}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left font-medium text-gray-900 min-w-[120px]">
                  Repas/Boissons
                </th>
                {joursLabels.map((jour, index) => (
                  <th key={jour} className="border border-gray-300 p-2 text-center font-medium text-gray-900 min-w-[100px]">
                    <div>{jour}</div>
                    <div className="text-xs text-gray-500">{weekDates[index]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoriesNutrition.map((categorie) => (
                <tr key={categorie.key} className={categorie.color}>
                  <td className="border border-gray-300 p-2 font-medium text-gray-900">
                    {categorie.label}
                  </td>
                  {jours.map((jour) => {
                    const jourData = currentWeekData.nutrition[jour as keyof typeof currentWeekData.nutrition];
                    const currentValue = jourData[categorie.key as keyof NutritionEntry];

                    return (
                      <td key={jour} className="border border-gray-300 p-1">
                        <textarea
                          value={currentValue}
                          onChange={(e) => updateNutritionEntry(currentWeek, jour, categorie.key, e.target.value)}
                          className="w-full h-16 p-1 text-xs border-0 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 bg-transparent"
                          placeholder="Aliments..."
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tableau Sommeil */}
      <div className="card">
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            SOMMEIL - Semaine {currentWeek}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-gray-300 p-2 text-left font-medium text-gray-900 min-w-[120px]">
                  Heures de sommeil
                </th>
                {joursLabels.map((jour, index) => (
                  <th key={jour} className="border border-gray-300 p-2 text-center font-medium text-gray-900 min-w-[100px]">
                    <div>{jour}</div>
                    <div className="text-xs text-gray-500">{weekDates[index]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-50">
                <td className="border border-gray-300 p-2 font-medium text-gray-900">
                  Coucher (22h45) / Réveil (6h00)
                </td>
                {jours.map((jour) => {
                  const sommeilValue = currentWeekData.sommeil[jour as keyof typeof currentWeekData.sommeil];

                  return (
                    <td key={jour} className="border border-gray-300 p-1">
                      <textarea
                        value={sommeilValue}
                        onChange={(e) => updateSommeilEntry(currentWeek, jour, e.target.value)}
                        className="w-full h-16 p-1 text-xs border-0 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 bg-transparent"
                        placeholder="Coucher/Réveil..."
                      />
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Résumé de la semaine {currentWeek}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-center">
              <div className="text-2xl mb-1">🍽️</div>
              <h4 className="font-medium text-gray-900 text-sm mb-2">Alimentation</h4>
              <div className="text-xs text-gray-600">
                {Object.values(currentWeekData.nutrition).filter(jour =>
                  Object.values(jour).some(repas => repas.trim() !== '')
                ).length}/7 jours remplis
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <div className="text-2xl mb-1">😴</div>
              <h4 className="font-medium text-gray-900 text-sm mb-2">Sommeil</h4>
              <div className="text-xs text-gray-600">
                {Object.values(currentWeekData.sommeil).filter(horaire =>
                  horaire.trim() !== ''
                ).length}/7 jours remplis
              </div>
            </div>
          </div>

          <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <div className="text-center">
              <div className="text-2xl mb-1">💧</div>
              <h4 className="font-medium text-gray-900 text-sm mb-2">Hydratation</h4>
              <div className="text-xs text-gray-600">
                {Object.values(currentWeekData.nutrition).filter(jour =>
                  jour.eauBoissons.trim() !== ''
                ).length}/7 jours suivis
              </div>
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-center">
              <div className="text-2xl mb-1">🍷</div>
              <h4 className="font-medium text-gray-900 text-sm mb-2">Alcool</h4>
              <div className="text-xs text-gray-600">
                {Object.values(currentWeekData.nutrition).filter(jour =>
                  jour.alcool.trim() !== ''
                ).length}/7 jours notés
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nutrition; 