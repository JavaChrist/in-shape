import React, { useState } from 'react';
import { CalendarIcon, CameraIcon, CalculatorIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MeasurementData {
  date: string;
  biceps: number;
  triceps: number;
  souScapulaire: number;
  supraIliaque: number;
  totalPlis: number;
  massGrasse: number;
}

const Measurements: React.FC = () => {
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState({
    biceps: 0,
    triceps: 0,
    souScapulaire: 0,
    supraIliaque: 0
  });
  const [userInfo, setUserInfo] = useState({
    age: 30,
    gender: 'homme' as 'homme' | 'femme'
  });

  // Helper function pour gérer l'erreur de chargement d'image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Erreur de chargement image:', e.currentTarget.src);
    e.currentTarget.style.display = 'none';
    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
    if (nextElement) {
      nextElement.style.display = 'flex';
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('Image chargée avec succès:', e.currentTarget.src);
  };

  // Calcul du taux de masse grasse selon la formule de Durnin & Womersley
  const calculateBodyFat = (totalPlis: number, age: number, gender: 'homme' | 'femme') => {
    let density = 0;

    if (gender === 'homme') {
      if (age >= 17 && age <= 19) {
        density = 1.1620 - (0.0678 * Math.log10(totalPlis));
      } else if (age >= 20 && age <= 29) {
        density = 1.1631 - (0.0632 * Math.log10(totalPlis));
      } else if (age >= 30 && age <= 39) {
        density = 1.1422 - (0.0544 * Math.log10(totalPlis));
      } else if (age >= 40 && age <= 49) {
        density = 1.1620 - (0.0700 * Math.log10(totalPlis));
      } else if (age >= 50) {
        density = 1.1715 - (0.0779 * Math.log10(totalPlis));
      } else {
        density = 1.1620 - (0.0678 * Math.log10(totalPlis)); // défaut 17-19 ans
      }
    } else {
      if (age >= 16 && age <= 19) {
        density = 1.1549 - (0.0678 * Math.log10(totalPlis));
      } else if (age >= 20 && age <= 29) {
        density = 1.1599 - (0.0717 * Math.log10(totalPlis));
      } else if (age >= 30 && age <= 39) {
        density = 1.1423 - (0.0632 * Math.log10(totalPlis));
      } else if (age >= 40 && age <= 49) {
        density = 1.1333 - (0.0612 * Math.log10(totalPlis));
      } else if (age >= 50) {
        density = 1.1339 - (0.0645 * Math.log10(totalPlis));
      } else {
        density = 1.1549 - (0.0678 * Math.log10(totalPlis)); // défaut 16-19 ans
      }
    }

    return ((4.95 / density) - 4.50) * 100;
  };



  const handleInputChange = (field: string, value: number) => {
    setCurrentMeasurement(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMeasurement = () => {
    const totalPlis = currentMeasurement.biceps + currentMeasurement.triceps +
      currentMeasurement.souScapulaire + currentMeasurement.supraIliaque;

    const massGrasse = calculateBodyFat(totalPlis, userInfo.age, userInfo.gender);

    const newMeasurement: MeasurementData = {
      date: new Date().toLocaleDateString('fr-FR'),
      ...currentMeasurement,
      totalPlis,
      massGrasse: Math.round(massGrasse * 10) / 10
    };

    setMeasurements(prev => [...prev, newMeasurement]);

    // Reset du formulaire
    setCurrentMeasurement({
      biceps: 0,
      triceps: 0,
      souScapulaire: 0,
      supraIliaque: 0
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mesures Corporelles</h1>
          <p className="text-gray-600">Tableau de suivi quotidien - Calcul du taux de masse grasse</p>
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

      {/* Saisie des mesures */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CalculatorIcon className="h-5 w-5 mr-2" />
          Nouvelle mesure
        </h3>

        {/* Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Âge (années)
            </label>
            <input
              type="number"
              value={userInfo.age}
              onChange={(e) => setUserInfo(prev => ({ ...prev, age: parseInt(e.target.value) || 30 }))}
              className="input-field"
              min="16"
              max="80"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <select
              value={userInfo.gender}
              onChange={(e) => setUserInfo(prev => ({ ...prev, gender: e.target.value as 'homme' | 'femme' }))}
              className="input-field"
            >
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>
        </div>

        {/* Mesures des plis */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biceps (en mm)
            </label>
            <input
              type="number"
              step="0.1"
              value={currentMeasurement.biceps || ''}
              onChange={(e) => handleInputChange('biceps', parseFloat(e.target.value) || 0)}
              className="input-field"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Triceps (en mm)
            </label>
            <input
              type="number"
              step="0.1"
              value={currentMeasurement.triceps || ''}
              onChange={(e) => handleInputChange('triceps', parseFloat(e.target.value) || 0)}
              className="input-field"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sous-scapulaire (en mm)
            </label>
            <input
              type="number"
              step="0.1"
              value={currentMeasurement.souScapulaire || ''}
              onChange={(e) => handleInputChange('souScapulaire', parseFloat(e.target.value) || 0)}
              className="input-field"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supra-iliaque (en mm)
            </label>
            <input
              type="number"
              step="0.1"
              value={currentMeasurement.supraIliaque || ''}
              onChange={(e) => handleInputChange('supraIliaque', parseFloat(e.target.value) || 0)}
              className="input-field"
              placeholder="0.0"
            />
          </div>
        </div>

        {/* Résultats calculés */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900">Total des 4 plis</p>
            <p className="text-2xl font-bold text-blue-600">
              {(currentMeasurement.biceps + currentMeasurement.triceps +
                currentMeasurement.souScapulaire + currentMeasurement.supraIliaque).toFixed(1)} mm
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-900">Taux de masse grasse</p>
            <p className="text-2xl font-bold text-green-600">
              {calculateBodyFat(
                currentMeasurement.biceps + currentMeasurement.triceps +
                currentMeasurement.souScapulaire + currentMeasurement.supraIliaque,
                userInfo.age, userInfo.gender
              ).toFixed(1)}%
            </p>
          </div>

        </div>

        <button
          onClick={addMeasurement}
          className="btn-primary"
          disabled={!currentMeasurement.biceps && !currentMeasurement.triceps &&
            !currentMeasurement.souScapulaire && !currentMeasurement.supraIliaque}
        >
          Enregistrer la mesure
        </button>
      </div>

      {/* Graphique d'évolution */}
      {measurements.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Évolution de la masse grasse
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Masse grasse']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="massGrasse"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Taux de masse grasse (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tableau des mesures */}
      {measurements.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des mesures</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Biceps (mm)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Triceps (mm)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sous-scapulaire (mm)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supra-iliaque (mm)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total plis (mm)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Masse grasse (%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {measurements.map((measurement, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {measurement.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {measurement.biceps}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {measurement.triceps}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {measurement.souScapulaire}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {measurement.supraIliaque}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {measurement.totalPlis}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {measurement.massGrasse}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions avec photos */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CameraIcon className="h-5 w-5 mr-2" />
          Comment utiliser cette fonctionnalité ?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Biceps */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/images/measurements/biceps.png"
                  alt="Mesure du biceps"
                  className="w-full h-full object-cover rounded-lg"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
                <div className="hidden flex-col items-center justify-center w-full h-full">
                  <CameraIcon className="h-8 w-8 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Image Biceps</p>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800 mb-2">📏 Biceps (en mm)</h4>
                <p className="text-sm text-yellow-700">
                  <strong>Vertical</strong> / sur le biceps à mi distance entre le pit du coude et l'avant de l'épaule
                </p>
              </div>
            </div>
          </div>

          {/* Triceps */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/images/measurements/triceps.png"
                  alt="Mesure du triceps"
                  className="w-full h-full object-cover rounded-lg"
                  onError={handleImageError}
                />
                <div className="hidden flex-col items-center justify-center w-full h-full">
                  <CameraIcon className="h-8 w-8 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Image Triceps</p>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-orange-800 mb-2">📏 Triceps (en mm)</h4>
                <p className="text-sm text-orange-700">
                  <strong>Vertical</strong> / sur le triceps à mi distance entre le pit du coude et l'arrière de l'épaule
                </p>
              </div>
            </div>
          </div>

          {/* Sous-scapulaire */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/images/measurements/pli-oblique.png"
                  alt="Mesure sous-scapulaire"
                  className="w-full h-full object-cover rounded-lg"
                  onError={handleImageError}
                />
                <div className="hidden flex-col items-center justify-center w-full h-full">
                  <CameraIcon className="h-8 w-8 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Image Sous-scapulaire</p>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-green-800 mb-2">📏 Région sous scapulaire (en mm)</h4>
                <p className="text-sm text-green-700">
                  <strong>En oblique</strong> vers le bas et l'extérieur / en dessous sous la pointe de l'omoplate
                </p>
              </div>
            </div>
          </div>

          {/* Supra-iliaque */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/images/measurements/supra-iliaque.png"
                  alt="Mesure supra-iliaque"
                  className="w-full h-full object-cover rounded-lg"
                  onError={handleImageError}
                />
                <div className="hidden flex-col items-center justify-center w-full h-full">
                  <CameraIcon className="h-8 w-8 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Image Supra-iliaque</p>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-purple-800 mb-2">📏 Supra iliaque (en mm)</h4>
                <p className="text-sm text-purple-700">
                  <strong>En oblique</strong> vers le bas et l'intérieur / environ 2 cm au-dessus de la crête iliaque
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">📈 Calcul automatique</h4>
          <p className="text-sm text-blue-700">
            Le taux de masse grasse est calculé automatiquement selon la formule de Durnin & Womersley.
            Plus vous effectuez de mesures régulières, plus le graphique d'évolution sera précis pour suivre vos progrès !
          </p>
        </div>
      </div>



      {/* Tableau technique des coefficients */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          🔬 Coefficients techniques - Formule Durnin & Womersley
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hommes */}
          <div>
            <h4 className="font-medium text-blue-900 mb-3 text-center">👨 Hommes</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider border-r border-gray-300">

                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-blue-900 uppercase tracking-wider border-r border-gray-300">
                      17-19 ans
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-blue-900 uppercase tracking-wider border-r border-gray-300">
                      20-29 ans
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-blue-900 uppercase tracking-wider border-r border-gray-300">
                      30-39 ans
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-blue-900 uppercase tracking-wider border-r border-gray-300">
                      40-49 ans
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-blue-900 uppercase tracking-wider">
                      &gt;50 ans
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-300">C</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">1,1620</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">1,1631</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">1,1422</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">1,1620</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">1,1715</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-blue-900 border-r border-gray-300">M</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">0,0678</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">0,0632</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">0,0544</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">0,0700</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">0,0779</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Femmes */}
          <div>
            <h4 className="font-medium text-pink-900 mb-3 text-center">👩 Femmes</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-pink-900 uppercase tracking-wider border-r border-gray-300">

                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-pink-900 uppercase tracking-wider border-r border-gray-300">
                      16-19 ans
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-pink-900 uppercase tracking-wider border-r border-gray-300">
                      20-29 ans
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-pink-900 uppercase tracking-wider border-r border-gray-300">
                      30-39 ans
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-pink-900 uppercase tracking-wider border-r border-gray-300">
                      40-49 ans
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-pink-900 uppercase tracking-wider">
                      &gt;50 ans
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-pink-900 border-r border-gray-300">C</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">1,1549</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">1,1599</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">1,1423</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">1,1333</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">1,1339</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-pink-900 border-r border-gray-300">M</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">0,0678</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">0,0717</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">0,0632</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r border-gray-300">0,0612</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">0,0645</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">📐 Formule utilisée</h4>
          <p className="text-sm text-blue-700 mb-2">
            <strong>Densité corporelle = C - (M × log₁₀(somme des 4 plis))</strong>
          </p>
          <p className="text-sm text-blue-700">
            <strong>% Masse grasse = ((4,95 / Densité) - 4,50) × 100</strong>
          </p>
        </div>


      </div>
    </div>
  );
};

export default Measurements; 