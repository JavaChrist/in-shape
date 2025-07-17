import React, { useState } from 'react';
import { CalendarIcon, CheckCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface Habit {
  id: string;
  category: 'ALIMENTATION' | 'SOMMEIL' | 'SPORTS' | 'QUESTIONS & PROJECTION';
  text: string;
  completed: { [week: string]: boolean };
}

const Habits: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([
    // ALIMENTATION
    {
      id: 'alim1',
      category: 'ALIMENTATION',
      text: 'Mis le focus sur un petit déj salé',
      completed: {}
    },
    {
      id: 'alim2',
      category: 'ALIMENTATION',
      text: 'Segmente mes assiettes 50% légumes + 25% prot + 25% glucides',
      completed: {}
    },
    {
      id: 'alim3',
      category: 'ALIMENTATION',
      text: "Je n'ai pas grignoté entre les repas",
      completed: {}
    },
    {
      id: 'alim4',
      category: 'ALIMENTATION',
      text: "J'ai bu 2 litres d'eau par jour",
      completed: {}
    },
    {
      id: 'alim5',
      category: 'ALIMENTATION',
      text: "Je n'ai pas bu d'alcool",
      completed: {}
    },
    {
      id: 'alim6',
      category: 'ALIMENTATION',
      text: "J'ai atteint les XX g de prot / jour recommandé par mon coach",
      completed: {}
    },
    {
      id: 'alim7',
      category: 'ALIMENTATION',
      text: "J'ai effectué 24h de jeun",
      completed: {}
    },
    {
      id: 'alim8',
      category: 'ALIMENTATION',
      text: "J'ai mis en place de Carb cycling 3 jour LOW, 3 jours normaux et 1 jour JEUN",
      completed: {}
    },

    // SOMMEIL
    {
      id: 'sleep1',
      category: 'SOMMEIL',
      text: "J'ai dormi à intervalles réguliers",
      completed: {}
    },
    {
      id: 'sleep2',
      category: 'SOMMEIL',
      text: "J'ai eu un sommeil de qualité",
      completed: {}
    },

    // SPORTS
    {
      id: 'sport1',
      category: 'SPORTS',
      text: "J'ai marché tous les jours, 6000 pas minimum",
      completed: {}
    },
    {
      id: 'sport2',
      category: 'SPORTS',
      text: "J'ai marché 3 fois dans la semaine et atteint 8000 pas mini au moins 1 fois",
      completed: {}
    },
    {
      id: 'sport3',
      category: 'SPORTS',
      text: "J'ai effectué 2 séances de Sport (Pyramide ou Fatburner ou Super4)",
      completed: {}
    },
    {
      id: 'sport4',
      category: 'SPORTS',
      text: "J'ai effectué 3 séances de Sport ( Pyramide ou Fatburner ou Super4)",
      completed: {}
    },
    {
      id: 'sport5',
      category: 'SPORTS',
      text: "J'ai augmenté mes charges lors de mes excercies et suivi reco de mon coach",
      completed: {}
    },

    // QUESTIONS & PROJECTION
    {
      id: 'quest1',
      category: 'QUESTIONS & PROJECTION',
      text: "J'ai posé les questions à mon coach dans mon fil Telegram",
      completed: {}
    },
    {
      id: 'quest2',
      category: 'QUESTIONS & PROJECTION',
      text: "J'ai reçu les réponses et elles sont claires pour moi",
      completed: {}
    },
    {
      id: 'quest3',
      category: 'QUESTIONS & PROJECTION',
      text: "J'ai planifié ma semaine à venir",
      completed: {}
    },
    {
      id: 'quest4',
      category: 'QUESTIONS & PROJECTION',
      text: "J'ai perdu du poids factuellement",
      completed: {}
    },
    {
      id: 'quest5',
      category: 'QUESTIONS & PROJECTION',
      text: "J'ai perdu du tour de taille factuellement",
      completed: {}
    },
    {
      id: 'quest6',
      category: 'QUESTIONS & PROJECTION',
      text: "J'ai rempli mon tableau semaine pour que mon coach puisse bien analyser la sem",
      completed: {}
    },
    {
      id: 'quest7',
      category: 'QUESTIONS & PROJECTION',
      text: "J'ai apprit de nouvelles choses que je vais pouvoir mettre en place",
      completed: {}
    }
  ]);

  const toggleHabit = (habitId: string, week: number) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          completed: {
            ...habit.completed,
            [week]: !habit.completed[week]
          }
        };
      }
      return habit;
    }));
  };

  const getWeekProgress = (week: number) => {
    const totalHabits = habits.length;
    const completedHabits = habits.filter(habit => habit.completed[week]).length;
    return totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  };

  const getCategoryProgress = (category: string, week: number) => {
    const categoryHabits = habits.filter(habit => habit.category === category);
    const completedCategoryHabits = categoryHabits.filter(habit => habit.completed[week]).length;
    return categoryHabits.length > 0 ? Math.round((completedCategoryHabits / categoryHabits.length) * 100) : 0;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ALIMENTATION': return 'bg-green-50 border-green-200 text-green-800';
      case 'SOMMEIL': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'SPORTS': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'QUESTIONS & PROJECTION': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const generateWeekNumbers = () => {
    const weeks = [];
    for (let i = 0; i <= 52; i++) {
      weeks.push(i);
    }
    return weeks;
  };

  const weekNumbers = generateWeekNumbers();
  const categories = ['ALIMENTATION', 'SOMMEIL', 'SPORTS', 'QUESTIONS & PROJECTION'];

  // Détermine quelles semaines afficher selon le mode
  const getWeeksToDisplay = () => {
    if (showAllWeeks) {
      return weekNumbers; // Toutes les semaines S0-S52
    } else {
      // Vue condensée : S0-S20 + ... + S50-S52
      return [
        ...weekNumbers.slice(0, 21), // S0 à S20
        -1, // Indicateur pour "..."
        ...weekNumbers.slice(50, 53) // S50 à S52
      ];
    }
  };

  const weeksToDisplay = getWeeksToDisplay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tracking Habitudes</h1>
          <p className="text-gray-600">Mes Focus semaine - Suivi hebdomadaire de vos objectifs sur 52 semaines</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4" />
          <span>Semaine courante: S{currentWeek}</span>
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
              {weekNumbers.map(week => (
                <option key={week} value={week}>
                  Semaine S{week}
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

        {/* Progression globale */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression S{currentWeek}</span>
            <span className="text-sm font-bold text-gray-900">{getWeekProgress(currentWeek)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getWeekProgress(currentWeek)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tableau principal des habitudes */}
      <div className="card">
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            <span className="text-green-600 bg-green-100 px-2 py-1 rounded">
              Mes Focus semaine, cette semaine j'ai :
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 text-left font-medium text-gray-900 min-w-[300px] bg-green-100">
                  Habitudes par catégorie
                </th>
                {weeksToDisplay.map((week, index) => (
                  <th key={week === -1 ? `ellipsis-${index}` : week} className="border border-gray-300 p-1 text-center font-medium text-gray-900 min-w-[40px] bg-green-100">
                    <div className="text-xs">
                      {week === -1 ? '...' : `S${week}`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <React.Fragment key={category}>
                  {/* En-tête de catégorie */}
                  <tr className={getCategoryColor(category)}>
                    <td className="border border-gray-300 p-3 font-bold text-sm">
                      {category}
                    </td>
                    {weeksToDisplay.map((week, index) => (
                      <td key={week === -1 ? `ellipsis-${index}` : week} className="border border-gray-300 p-1 text-center">
                        <div className="text-xs font-medium">
                          {week === -1 ? '...' : `${getCategoryProgress(category, week)}%`}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Habitudes de la catégorie */}
                  {habits
                    .filter(habit => habit.category === category)
                    .map(habit => (
                      <tr key={habit.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 text-sm text-blue-700">
                          {habit.text}
                        </td>
                        {weeksToDisplay.map((week, index) => (
                          <td key={week === -1 ? `ellipsis-${index}` : week} className="border border-gray-300 p-1 text-center">
                            {week === -1 ? (
                              <div className="text-xs text-gray-400">...</div>
                            ) : (
                              <button
                                onClick={() => toggleHabit(habit.id, week)}
                                className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ${habit.completed[week]
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-gray-400 bg-white'
                                  }`}
                              >
                                {habit.completed[week] && (
                                  <CheckCircleIcon className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bouton pour basculer l'affichage */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAllWeeks(!showAllWeeks)}
            className="btn btn-primary"
          >
            {showAllWeeks ? '📋 Affichage condensé' : '📊 Afficher les 52 semaines complètes'}
          </button>
          <p className="text-xs text-gray-600 mt-2">
            {showAllWeeks
              ? 'Actuellement : Vue complète des 52 semaines - Cliquez pour revenir à la vue condensée'
              : 'Actuellement : Affichage condensé S0-S20 et S50-S52 - Cliquez pour la vue complète'
            }
          </p>
        </div>
      </div>

      {/* Résumé de la semaine courante */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Résumé Semaine S{currentWeek}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(category => {
            const progress = getCategoryProgress(category, currentWeek);
            const categoryHabits = habits.filter(habit => habit.category === category);
            const completedCount = categoryHabits.filter(habit => habit.completed[currentWeek]).length;

            return (
              <div key={category} className={`p-4 rounded-lg border ${getCategoryColor(category)}`}>
                <div className="text-center">
                  <h4 className="font-medium text-sm mb-2">{category}</h4>
                  <div className="text-2xl font-bold mb-1">{progress}%</div>
                  <div className="text-xs">
                    {completedCount}/{categoryHabits.length} objectifs
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message de motivation */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
          <div className="text-center">
            {getWeekProgress(currentWeek) === 100 ? (
              <p className="text-primary-800 font-medium">
                🎉 Félicitations ! Vous avez atteint tous vos objectifs cette semaine !
              </p>
            ) : getWeekProgress(currentWeek) >= 80 ? (
              <p className="text-primary-800 font-medium">
                💪 Excellent travail ! Vous êtes sur la bonne voie !
              </p>
            ) : getWeekProgress(currentWeek) >= 50 ? (
              <p className="text-primary-800 font-medium">
                📈 Bon début ! Continuez vos efforts pour atteindre vos objectifs !
              </p>
            ) : (
              <p className="text-primary-800 font-medium">
                🚀 C'est le moment de vous concentrer sur vos habitudes ! Chaque petit pas compte !
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Habits; 