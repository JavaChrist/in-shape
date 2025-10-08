import React, { useState, useEffect } from 'react';
import { CalendarIcon, ChartBarIcon, ClockIcon, CloudArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

interface NutritionEntry {
  petitDejeuner: string;
  dejeuner: string;
  collation: string;
  diner: string;
  eauBoissons: string;
  alcool: string;
}

interface SommeilEntry {
  coucher: string;
  reveil: string;
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
    lundi: SommeilEntry;
    mardi: SommeilEntry;
    mercredi: SommeilEntry;
    jeudi: SommeilEntry;
    vendredi: SommeilEntry;
    samedi: SommeilEntry;
    dimanche: SommeilEntry;
  };
}

const Nutrition: React.FC = () => {
  const { user } = useAuthStore();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weekData, setWeekData] = useState<{ [week: number]: WeekData }>({});
  // isLoading removed - not used in this component
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState('lundi');

  // Charger les données nutrition depuis Firebase
  useEffect(() => {
    const loadNutritionData = async () => {
      if (!user?.id) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.nutritionData) {
            // Migrer les anciennes données si nécessaire
            const migratedData = { ...userData.nutritionData };

            Object.keys(migratedData).forEach(week => {
              const weekData = migratedData[parseInt(week)];
              if (weekData.sommeil) {
                Object.keys(weekData.sommeil).forEach(jour => {
                  let sommeilData: any = weekData.sommeil[jour as keyof typeof weekData.sommeil];

                  // Si c'est une string (ancien format), convertir en objet
                  if (typeof sommeilData === 'string') {
                    const match = (sommeilData as string).match(/(\d{1,2}h?\d{0,2})\s*-\s*(\d{1,2}h?\d{0,2})/);
                    if (match) {
                      // Convertir format français vers format HTML5
                      const convertToTimeFormat = (timeStr: string) => {
                        const cleaned = timeStr.replace('h', ':');
                        const parts = cleaned.split(':');
                        const hours = parts[0].padStart(2, '0');
                        const minutes = parts[1] || '00';
                        return `${hours}:${minutes.padStart(2, '0')}`;
                      };

                      const coucher = convertToTimeFormat(match[1]);
                      const reveil = convertToTimeFormat(match[2]);
                      (weekData.sommeil as any)[jour] = { coucher, reveil };
                    } else {
                      (weekData.sommeil as any)[jour] = { coucher: '', reveil: '' };
                    }
                  }
                });
              }
            });

            setWeekData(migratedData);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données nutrition:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        // Loading completed
      }
    };

    loadNutritionData();
  }, [user]);

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
          lundi: { coucher: '', reveil: '' },
          mardi: { coucher: '', reveil: '' },
          mercredi: { coucher: '', reveil: '' },
          jeudi: { coucher: '', reveil: '' },
          vendredi: { coucher: '', reveil: '' },
          samedi: { coucher: '', reveil: '' },
          dimanche: { coucher: '', reveil: '' }
        }
      };
    }
    return weekData[week];
  };

  const cleanDataForFirebase = (data: { [week: number]: WeekData }) => {
    const cleanedData = { ...data };

    // Nettoyer les valeurs undefined et migrer les anciennes données
    Object.keys(cleanedData).forEach(week => {
      const weekData = cleanedData[parseInt(week)];

      // Nettoyer les données de sommeil et migrer si nécessaire
      Object.keys(weekData.sommeil).forEach(jour => {
        let sommeilData: any = weekData.sommeil[jour as keyof typeof weekData.sommeil];

        // Si c'est une string (ancien format), convertir en objet
        if (typeof sommeilData === 'string') {
          // Essayer de parser l'ancien format "22h45 - 6h00"
          const match = (sommeilData as string).match(/(\d{1,2}h?\d{0,2})\s*-\s*(\d{1,2}h?\d{0,2})/);
          if (match) {
            // Convertir format français vers format HTML5
            const convertToTimeFormat = (timeStr: string) => {
              const cleaned = timeStr.replace('h', ':');
              const parts = cleaned.split(':');
              const hours = parts[0].padStart(2, '0');
              const minutes = parts[1] || '00';
              return `${hours}:${minutes.padStart(2, '0')}`;
            };

            const coucher = convertToTimeFormat(match[1]);
            const reveil = convertToTimeFormat(match[2]);
            sommeilData = { coucher, reveil };
          } else {
            sommeilData = { coucher: '', reveil: '' };
          }
          (weekData.sommeil as any)[jour] = sommeilData;
        }

        // S'assurer que l'objet a les bonnes propriétés
        if (typeof sommeilData === 'object' && sommeilData) {
          if (!sommeilData.coucher) sommeilData.coucher = '';
          if (!sommeilData.reveil) sommeilData.reveil = '';
        }
      });
    });

    return cleanedData;
  };

  const saveToFirebase = async (updatedWeekData: { [week: number]: WeekData }) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const cleanedData = cleanDataForFirebase(updatedWeekData);
      await updateDoc(doc(db, 'users', user.id), {
        nutritionData: cleanedData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde nutrition:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const updateNutritionEntry = (week: number, jour: string, categorie: string, value: string) => {
    const updatedWeekData = { ...weekData };
    const currentData = getWeekData(week);
    const currentJourData = currentData.nutrition[jour as keyof typeof currentData.nutrition];

    updatedWeekData[week] = {
      ...currentData,
      nutrition: {
        ...currentData.nutrition,
        [jour]: {
          ...currentJourData,
          [categorie]: value
        }
      }
    };

    setWeekData(updatedWeekData);

    // Sauvegarde automatique avec debounce
    setTimeout(() => {
      saveToFirebase(updatedWeekData);
    }, 1000);
  };

  const updateSommeilEntry = (week: number, jour: string, field: 'coucher' | 'reveil', value: string) => {
    const updatedWeekData = { ...weekData };
    const currentData = getWeekData(week);
    const currentSommeilData = currentData.sommeil[jour as keyof typeof currentData.sommeil];

    // S'assurer que currentSommeilData existe et a les bonnes propriétés
    const safeSommeilData = {
      coucher: currentSommeilData?.coucher || '',
      reveil: currentSommeilData?.reveil || ''
    };

    updatedWeekData[week] = {
      ...currentData,
      sommeil: {
        ...currentData.sommeil,
        [jour]: {
          ...safeSommeilData,
          [field]: value || ''
        }
      }
    };

    setWeekData(updatedWeekData);

    // Sauvegarde automatique avec debounce
    setTimeout(() => {
      saveToFirebase(updatedWeekData);
    }, 1000);
  };

  const setSommeilPreset = (week: number, jour: string, coucher: string, reveil: string) => {
    const updatedWeekData = { ...weekData };
    const currentData = getWeekData(week);

    updatedWeekData[week] = {
      ...currentData,
      sommeil: {
        ...currentData.sommeil,
        [jour]: {
          coucher: coucher || '',
          reveil: reveil || ''
        }
      }
    };

    setWeekData(updatedWeekData);

    // Sauvegarde automatique avec debounce
    setTimeout(() => {
      saveToFirebase(updatedWeekData);
    }, 1000);
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
        <div className="flex items-center space-x-4">
          {isSaving && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <CloudArrowUpIcon className="h-4 w-4 animate-pulse" />
              <span>Sauvegarde...</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4" />
            <span>Semaine {currentWeek}</span>
          </div>
        </div>
      </div>

      {/* Navigation des semaines */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Navigation par semaines</h3>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
              disabled={currentWeek <= 0}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '12px',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronLeftIcon style={{ width: '32px', height: '32px', strokeWidth: 2 }} />
            </button>
            <select
              value={currentWeek}
              onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-center font-medium"
              style={{ minWidth: '140px' }}
            >
              {Array.from({ length: 53 }, (_, i) => (
                <option key={i} value={i}>
                  Semaine {i}
                </option>
              ))}
            </select>
            <button
              onClick={() => setCurrentWeek(Math.min(52, currentWeek + 1))}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
              disabled={currentWeek >= 52}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '12px',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronRightIcon style={{ width: '32px', height: '32px', strokeWidth: 2 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Interface par jour (mobile et desktop) */}
      <div className="card" style={{ display: 'block !important' }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ALIMENTATION & SOMMEIL - Semaine {currentWeek}
        </h3>

        {/* Navigation des jours */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {jours.map((jour, index) => (
            <button
              key={jour}
              onClick={() => setSelectedDay(jour)}
              className={`p-2 text-xs rounded-md transition-colors ${selectedDay === jour
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              style={{
                border: 'none',
                outline: 'none'
              }}
            >
              <div className="font-medium">{joursLabels[index]}</div>
              <div className="text-xs opacity-75">{weekDates[index]}</div>
            </button>
          ))}
        </div>

        {/* Formulaires pour le jour sélectionné */}
        <div className="space-y-4">
          {/* Nutrition du jour */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Alimentation - {selectedDay}</h4>
            <div className="space-y-3">
              {categoriesNutrition.map((categorie) => {
                const jourData = currentWeekData.nutrition[selectedDay as keyof typeof currentWeekData.nutrition];
                const currentValue = jourData[categorie.key as keyof NutritionEntry];

                return (
                  <div key={categorie.key} className={`p-3 rounded-lg border ${categorie.color}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {categorie.label}
                    </label>
                    <textarea
                      value={currentValue}
                      onChange={(e) => updateNutritionEntry(currentWeek, selectedDay, categorie.key, e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={2}
                      placeholder="Aliments consommés..."
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sommeil du jour */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Sommeil - {selectedDay}</h4>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 gap-4">
                {/* Heure de coucher */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Heure de coucher
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSommeilPreset(currentWeek, selectedDay, '22:45', currentWeekData.sommeil[selectedDay as keyof typeof currentWeekData.sommeil]?.reveil || '')}
                        className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-800"
                      >
                        22h45
                      </button>
                      <button
                        onClick={() => setSommeilPreset(currentWeek, selectedDay, '23:00', currentWeekData.sommeil[selectedDay as keyof typeof currentWeekData.sommeil]?.reveil || '')}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-800"
                      >
                        23h
                      </button>
                    </div>
                    <input
                      type="time"
                      value={currentWeekData.sommeil[selectedDay as keyof typeof currentWeekData.sommeil]?.coucher || ''}
                      onChange={(e) => updateSommeilEntry(currentWeek, selectedDay, 'coucher', e.target.value)}
                      className="w-full p-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Heure de réveil */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Heure de réveil
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSommeilPreset(currentWeek, selectedDay, currentWeekData.sommeil[selectedDay as keyof typeof currentWeekData.sommeil]?.coucher || '', '06:00')}
                        className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-800"
                      >
                        6h00
                      </button>
                      <button
                        onClick={() => setSommeilPreset(currentWeek, selectedDay, currentWeekData.sommeil[selectedDay as keyof typeof currentWeekData.sommeil]?.coucher || '', '06:30')}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-800"
                      >
                        6h30
                      </button>
                    </div>
                    <input
                      type="time"
                      value={currentWeekData.sommeil[selectedDay as keyof typeof currentWeekData.sommeil]?.reveil || ''}
                      onChange={(e) => updateSommeilEntry(currentWeek, selectedDay, 'reveil', e.target.value)}
                      className="w-full p-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau Nutrition (masqué, remplacé par l'interface ci-dessus) */}
      <div className="card hidden">

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
                  Horaires de sommeil
                </th>
                {joursLabels.map((jour, index) => (
                  <th key={jour} className="border border-gray-300 p-2 text-center font-medium text-gray-900 min-w-[120px]">
                    <div>{jour}</div>
                    <div className="text-xs text-gray-500">{weekDates[index]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-50">
                <td className="border border-gray-300 p-2 font-medium text-gray-900">
                  Heure de coucher
                </td>
                {jours.map((jour) => {
                  const sommeilData = currentWeekData.sommeil[jour as keyof typeof currentWeekData.sommeil];

                  return (
                    <td key={jour} className="border border-gray-300 p-1">
                      <div className="space-y-1">
                        {/* Boutons rapides pour le coucher */}
                        <div className="flex gap-1 mb-1">
                          <button
                            onClick={() => setSommeilPreset(currentWeek, jour, '22:45', sommeilData.reveil || '')}
                            className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-800"
                            title="22h45"
                          >
                            22h45
                          </button>
                          <button
                            onClick={() => setSommeilPreset(currentWeek, jour, '23:00', sommeilData.reveil || '')}
                            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-800"
                            title="23h00"
                          >
                            23h
                          </button>
                        </div>
                        {/* Champ manuel */}
                        <input
                          type="time"
                          value={sommeilData.coucher || ''}
                          onChange={(e) => updateSommeilEntry(currentWeek, jour, 'coucher', e.target.value)}
                          className="w-full p-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr className="bg-blue-50">
                <td className="border border-gray-300 p-2 font-medium text-gray-900">
                  Heure de réveil
                </td>
                {jours.map((jour) => {
                  const sommeilData = currentWeekData.sommeil[jour as keyof typeof currentWeekData.sommeil];

                  return (
                    <td key={jour} className="border border-gray-300 p-1">
                      <div className="space-y-1">
                        {/* Boutons rapides pour le réveil */}
                        <div className="flex gap-1 mb-1">
                          <button
                            onClick={() => setSommeilPreset(currentWeek, jour, sommeilData.coucher || '', '06:00')}
                            className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-800"
                            title="6h00"
                          >
                            6h00
                          </button>
                          <button
                            onClick={() => setSommeilPreset(currentWeek, jour, sommeilData.coucher || '', '06:30')}
                            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-800"
                            title="6h30"
                          >
                            6h30
                          </button>
                        </div>
                        {/* Champ manuel */}
                        <input
                          type="time"
                          value={sommeilData.reveil || ''}
                          onChange={(e) => updateSommeilEntry(currentWeek, jour, 'reveil', e.target.value)}
                          className="w-full p-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
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
              <h4 className="font-medium text-gray-900 text-sm mb-2">Sommeil</h4>
              <div className="text-xs text-gray-600">
                {Object.values(currentWeekData.sommeil).filter((horaire: any) =>
                  horaire.coucher?.trim() !== '' && horaire.reveil?.trim() !== ''
                ).length}/7 jours remplis
              </div>
            </div>
          </div>

          <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <div className="text-center">
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