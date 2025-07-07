import React, { useState } from 'react';
import { CalendarIcon, FireIcon, PlusIcon, ChartBarIcon, PlayIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ExerciseData {
  id: string;
  date: string;
  exerciseName: string;
  type: 'force' | 'cardio' | 'etirements' | 'pyramide';
  weight: number;
  reps: number;
  sets: number;
  comments: string;
  sensation: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // 1=très difficile, 10=très facile
  coachRecommendation?: string;
}

interface ExerciseTemplate {
  name: string;
  type: 'force' | 'cardio' | 'etirements' | 'pyramide';
  defaultReps?: number;
  defaultSets?: number;
}

const Exercise: React.FC = () => {
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [currentExercise, setCurrentExercise] = useState({
    exerciseName: '',
    type: 'force' as 'force' | 'cardio' | 'etirements' | 'pyramide',
    weight: 0,
    reps: 0,
    sets: 0,
    comments: '',
    sensation: 5 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  });

  // Templates d'exercices basés sur tes tableaux Excel
  const exerciseTemplates: ExerciseTemplate[] = [
    { name: 'Swings', type: 'cardio', defaultReps: 20, defaultSets: 3 },
    { name: 'Front Squats', type: 'force', defaultReps: 8, defaultSets: 3 },
    { name: 'Développé militaire', type: 'force', defaultReps: 8, defaultSets: 3 },
    { name: 'Tirage planche', type: 'force', defaultReps: 10, defaultSets: 3 },
    { name: 'Pompes', type: 'force', defaultReps: 15, defaultSets: 3 },
    { name: 'Rowing haltère', type: 'force', defaultReps: 12, defaultSets: 3 },
    { name: 'Rowing bûcheron', type: 'force', defaultReps: 10, defaultSets: 3 },
    { name: 'Curl Biceps', type: 'force', defaultReps: 12, defaultSets: 3 },
    { name: 'Triceps haltères', type: 'force', defaultReps: 12, defaultSets: 3 },
    { name: 'Triceps pongés', type: 'force', defaultReps: 10, defaultSets: 3 },
    { name: 'Squat barre', type: 'force', defaultReps: 10, defaultSets: 3 },
    { name: 'SDT barre', type: 'force', defaultReps: 8, defaultSets: 3 },
    { name: 'Développé couché', type: 'force', defaultReps: 8, defaultSets: 3 },
    { name: 'Étirements complets', type: 'etirements', defaultReps: 1, defaultSets: 1 }
  ];

  const handleExerciseSelect = (template: ExerciseTemplate) => {
    setCurrentExercise(prev => ({
      ...prev,
      exerciseName: template.name,
      type: template.type,
      reps: template.defaultReps || 0,
      sets: template.defaultSets || 0
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setCurrentExercise(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addExercise = () => {
    const newExercise: ExerciseData = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('fr-FR'),
      ...currentExercise
    };

    setExercises(prev => [...prev, newExercise]);

    // Reset du formulaire
    setCurrentExercise({
      exerciseName: '',
      type: 'force' as 'force' | 'cardio' | 'etirements' | 'pyramide',
      weight: 0,
      reps: 0,
      sets: 0,
      comments: '',
      sensation: 5 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
    });
  };

  const getSensationText = (sensation: number) => {
    return sensation.toString();
  };

  const getSensationColor = (sensation: number) => {
    if (sensation <= 2) return 'text-red-600';
    if (sensation <= 4) return 'text-orange-600';
    if (sensation <= 6) return 'text-yellow-600';
    if (sensation <= 8) return 'text-green-600';
    return 'text-blue-600';
  };

  // Données pour les graphiques
  const chartData = exercises
    .filter(ex => ex.type === 'force')
    .slice(-10) // Derniers 10 exercices
    .map(ex => ({
      date: ex.date,
      poids: ex.weight,
      exercice: ex.exerciseName,
      volume: ex.weight * ex.reps * ex.sets
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercices</h1>
          <p className="text-gray-600">Suivi de vos séances d'entraînement</p>
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

      {/* Sélection rapide d'exercices */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FireIcon className="h-5 w-5 mr-2" />
          Exercices disponibles
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {exerciseTemplates.map((template) => (
            <button
              key={template.name}
              onClick={() => handleExerciseSelect(template)}
              className={`p-3 rounded-lg border text-left transition-colors ${currentExercise.exerciseName === template.name
                ? 'border-primary-500 bg-primary-50 text-primary-900'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {template.type === 'force' && '💪 Force'}
                {template.type === 'cardio' && '❤️ Cardio'}
                {template.type === 'etirements' && '🧘 Étirements'}
                {template.type === 'pyramide' && '🔺 Pyramide'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire de saisie */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvelle séance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exercice
            </label>
            <input
              type="text"
              value={currentExercise.exerciseName}
              onChange={(e) => handleInputChange('exerciseName', e.target.value)}
              className="input-field"
              placeholder="Nom de l'exercice"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={currentExercise.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="input-field"
            >
              <option value="force">💪 Force</option>
              <option value="cardio">❤️ Cardio</option>
              <option value="etirements">🧘 Étirements</option>
              <option value="pyramide">🔺 Pyramide</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poids (kg)
            </label>
            <input
              type="number"
              step="0.5"
              value={currentExercise.weight || ''}
              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
              className="input-field"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Répétitions
            </label>
            <input
              type="number"
              value={currentExercise.reps || ''}
              onChange={(e) => handleInputChange('reps', parseInt(e.target.value) || 0)}
              className="input-field"
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Séries
            </label>
            <input
              type="number"
              value={currentExercise.sets || ''}
              onChange={(e) => handleInputChange('sets', parseInt(e.target.value) || 0)}
              className="input-field"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sensation
            </label>
            <select
              value={currentExercise.sensation}
              onChange={(e) => handleInputChange('sensation', parseInt(e.target.value))}
              className="input-field"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
              <option value={9}>9</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commentaires (sensations, douleurs, observations...)
          </label>
          <textarea
            value={currentExercise.comments}
            onChange={(e) => handleInputChange('comments', e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Ex: Bonne sensation, léger mal de dos, augmenter le poids la prochaine fois..."
          />
        </div>

        {/* Résumé */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-blue-900 mb-2">Résumé de la séance</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Volume total:</span>
              <p className="font-bold text-blue-900">
                {(currentExercise.weight * currentExercise.reps * currentExercise.sets).toFixed(1)} kg
              </p>
            </div>
            <div>
              <span className="text-blue-700">Répétitions totales:</span>
              <p className="font-bold text-blue-900">
                {currentExercise.reps * currentExercise.sets}
              </p>
            </div>
            <div>
              <span className="text-blue-700">Sensation:</span>
              <p className={`font-bold ${getSensationColor(currentExercise.sensation)}`}>
                {getSensationText(currentExercise.sensation)}
              </p>
            </div>
            <div>
              <span className="text-blue-700">Temps estimé:</span>
              <p className="font-bold text-blue-900">
                {Math.max(currentExercise.sets * 2, 5)} min
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={addExercise}
          className="btn-primary"
          disabled={!currentExercise.exerciseName || !currentExercise.reps}
        >
          Enregistrer la séance
        </button>
      </div>

      {/* Graphiques d'évolution */}
      {exercises.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des poids */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Évolution des poids
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [`${value} kg`, 'Poids']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="poids"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name="Poids (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Volume d'entraînement */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Volume d'entraînement
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [`${value} kg`, 'Volume']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="volume"
                    fill="#10b981"
                    name="Volume total (kg)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Historique des séances */}
      {exercises.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des séances</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exercice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poids
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reps × Sets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sensation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commentaires
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exercises.slice().reverse().map((exercise) => (
                  <tr key={exercise.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {exercise.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {exercise.exerciseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exercise.type === 'force' && '💪 Force'}
                      {exercise.type === 'cardio' && '❤️ Cardio'}
                      {exercise.type === 'etirements' && '🧘 Étirements'}
                      {exercise.type === 'pyramide' && '🔺 Pyramide'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exercise.weight} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exercise.reps} × {exercise.sets}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      {(exercise.weight * exercise.reps * exercise.sets).toFixed(1)} kg
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getSensationColor(exercise.sensation)}`}>
                      {getSensationText(exercise.sensation)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {exercise.comments || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section Pyramide (comme dans tes tableaux) */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PlayIcon className="h-5 w-5 mr-2" />
          Pyramide (Vidéo exemple)
        </h3>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 mb-2">
            <strong>Rappel :</strong> Enchaîne les exercices le plus vite possible et prend des pauses quand tu veux
          </p>
          <p className="text-xs text-green-600">
            Note bien ton temps total ici → ⏱️
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="font-medium text-yellow-800">Objectif</div>
            <div className="text-2xl font-bold text-yellow-600">&lt; 15 min</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-800">Difficulté</div>
            <div className="text-2xl font-bold text-blue-600">⭐⭐⭐</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-800">Matériel</div>
            <div className="text-sm font-bold text-purple-600">Haltères + Barre</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="font-medium text-red-800">Type</div>
            <div className="text-sm font-bold text-red-600">Circuit Training</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exercise; 