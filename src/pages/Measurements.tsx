import React, { useState, useEffect } from 'react';
import { CalendarIcon, CameraIcon, CalculatorIcon, ChartBarIcon, ScaleIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

interface MeasurementData {
  id: string;
  date: string;
  biceps: number;
  triceps: number;
  souScapulaire: number;
  supraIliaque: number;
  totalPlis: number;
  massGrasse: number;
}

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  note?: string;
}

const Measurements: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState({
    biceps: 0,
    triceps: 0,
    souScapulaire: 0,
    supraIliaque: 0
  });
  const [currentWeight, setCurrentWeight] = useState({
    weight: 0,
    note: ''
  });
  const [userInfo, setUserInfo] = useState({
    age: 30,
    gender: 'homme' as 'homme' | 'femme'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null);
  const [editingMeasurementId, setEditingMeasurementId] = useState<string | null>(null);
  const [editWeightForm, setEditWeightForm] = useState<WeightEntry | null>(null);
  const [editMeasurementForm, setEditMeasurementForm] = useState<MeasurementData | null>(null);

  // Charger les données utilisateur depuis Firebase
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Charger l'âge et autres infos du profil
          if (userData.personalInfo) {
            setUserInfo(prev => ({
              ...prev,
              age: userData.personalInfo.age || 30
            }));

            // Initialiser le poids actuel
            if (userData.personalInfo.poidsActuel) {
              setCurrentWeight(prev => ({
                ...prev,
                weight: userData.personalInfo.poidsActuel
              }));
            }
          }

          // Charger les mesures existantes
          if (userData.measurements) {
            setMeasurements(userData.measurements);
          }

          // Charger les pesées existantes
          if (userData.weightEntries) {
            setWeightEntries(userData.weightEntries);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

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
        density = 1.1549 - (0.0678 * Math.log10(totalPlis)); // défaut 16-19
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

  const addMeasurement = async () => {
    if (!user?.id) return;

    try {
      const totalPlis = currentMeasurement.biceps + currentMeasurement.triceps +
        currentMeasurement.souScapulaire + currentMeasurement.supraIliaque;

      const massGrasse = calculateBodyFat(totalPlis, userInfo.age, userInfo.gender);

      const newMeasurement: MeasurementData = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        ...currentMeasurement,
        totalPlis: Math.round(totalPlis * 100) / 100, // 2 décimales
        massGrasse: Math.round(massGrasse * 10) / 10
      };

      const updatedMeasurements = [...measurements, newMeasurement];

      // Sauvegarder dans Firestore
      await updateDoc(doc(db, 'users', user.id), {
        measurements: updatedMeasurements,
        updatedAt: new Date().toISOString()
      });

      setMeasurements(updatedMeasurements);

      // Reset du formulaire
      setCurrentMeasurement({
        biceps: 0,
        triceps: 0,
        souScapulaire: 0,
        supraIliaque: 0
      });

      toast.success('Mesure enregistrée !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const addWeightEntry = async () => {
    if (!user?.id || !currentWeight.weight) return;

    try {
      const newWeightEntry: WeightEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        weight: currentWeight.weight,
        note: currentWeight.note || ''
      };

      const updatedWeightEntries = [...weightEntries, newWeightEntry];

      // Recalculer l'IMC avec le nouveau poids
      const userDoc = await getDoc(doc(db, 'users', user.id));
      let updatedPersonalInfo = { poidsActuel: currentWeight.weight };

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.personalInfo?.taille > 0) {
          const tailleM = userData.personalInfo.taille / 100;
          const imc = currentWeight.weight / (tailleM * tailleM);
          updatedPersonalInfo = {
            ...userData.personalInfo,
            poidsActuel: currentWeight.weight,
            imc: Math.round(imc * 10) / 10
          };
        }
      }

      // Sauvegarder dans Firestore
      await updateDoc(doc(db, 'users', user.id), {
        weightEntries: updatedWeightEntries,
        personalInfo: updatedPersonalInfo,
        updatedAt: new Date().toISOString()
      });

      setWeightEntries(updatedWeightEntries);

      // Mettre à jour le store global
      updateProfile({ updatedAt: new Date() });

      // Reset du formulaire
      setCurrentWeight({
        weight: currentWeight.weight, // Garder le poids pour la prochaine pesée
        note: ''
      });

      toast.success('Pesée enregistrée ! Le profil a été mis à jour.');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la pesée:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // Fonctions d'édition pour les pesées
  const startEditWeight = (entry: WeightEntry) => {
    setEditingWeightId(entry.id);
    setEditWeightForm({ ...entry });
  };

  const cancelEditWeight = () => {
    setEditingWeightId(null);
    setEditWeightForm(null);
  };

  const saveEditWeight = async () => {
    if (!user?.id || !editWeightForm) return;

    try {
      const updatedWeightEntries = weightEntries.map(entry =>
        entry.id === editWeightForm.id ? editWeightForm : entry
      );

      // Si c'est la dernière pesée, mettre à jour le profil
      const latestWeight = updatedWeightEntries[updatedWeightEntries.length - 1];
      if (editWeightForm.id === latestWeight.id) {
        await updateDoc(doc(db, 'users', user.id), {
          weightEntries: updatedWeightEntries,
          'personalInfo.poidsActuel': editWeightForm.weight,
          updatedAt: new Date().toISOString()
        });
        updateProfile({ updatedAt: new Date() });
      } else {
        await updateDoc(doc(db, 'users', user.id), {
          weightEntries: updatedWeightEntries,
          updatedAt: new Date().toISOString()
        });
      }

      setWeightEntries(updatedWeightEntries);
      setEditingWeightId(null);
      setEditWeightForm(null);
      toast.success('Pesée modifiée !');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const deleteWeight = async (id: string) => {
    if (!user?.id || !window.confirm('Êtes-vous sûr de vouloir supprimer cette pesée ?')) return;

    try {
      const updatedWeightEntries = weightEntries.filter(entry => entry.id !== id);

      // Si on supprime la dernière pesée, mettre à jour le profil avec l'avant-dernière
      const wasLatest = weightEntries[weightEntries.length - 1]?.id === id;
      if (wasLatest && updatedWeightEntries.length > 0) {
        const newLatestWeight = updatedWeightEntries[updatedWeightEntries.length - 1].weight;
        await updateDoc(doc(db, 'users', user.id), {
          weightEntries: updatedWeightEntries,
          'personalInfo.poidsActuel': newLatestWeight,
          updatedAt: new Date().toISOString()
        });
        updateProfile({ updatedAt: new Date() });
      } else {
        await updateDoc(doc(db, 'users', user.id), {
          weightEntries: updatedWeightEntries,
          updatedAt: new Date().toISOString()
        });
      }

      setWeightEntries(updatedWeightEntries);
      toast.success('Pesée supprimée !');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Fonctions d'édition pour les mesures
  const startEditMeasurement = (measurement: MeasurementData) => {
    setEditingMeasurementId(measurement.id);
    setEditMeasurementForm({ ...measurement });
  };

  const cancelEditMeasurement = () => {
    setEditingMeasurementId(null);
    setEditMeasurementForm(null);
  };

  const saveEditMeasurement = async () => {
    if (!user?.id || !editMeasurementForm) return;

    try {
      // Recalculer les totaux
      const totalPlis = editMeasurementForm.biceps + editMeasurementForm.triceps +
        editMeasurementForm.souScapulaire + editMeasurementForm.supraIliaque;
      const massGrasse = calculateBodyFat(totalPlis, userInfo.age, userInfo.gender);

      const updatedMeasurement = {
        ...editMeasurementForm,
        totalPlis: Math.round(totalPlis * 100) / 100, // 2 décimales
        massGrasse: Math.round(massGrasse * 10) / 10
      };

      const updatedMeasurements = measurements.map(measurement =>
        measurement.id === editMeasurementForm.id ? updatedMeasurement : measurement
      );

      await updateDoc(doc(db, 'users', user.id), {
        measurements: updatedMeasurements,
        updatedAt: new Date().toISOString()
      });

      setMeasurements(updatedMeasurements);
      setEditingMeasurementId(null);
      setEditMeasurementForm(null);
      toast.success('Mesure modifiée !');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const deleteMeasurement = async (id: string) => {
    if (!user?.id || !window.confirm('Êtes-vous sûr de vouloir supprimer cette mesure ?')) return;

    try {
      const updatedMeasurements = measurements.filter(measurement => measurement.id !== id);

      await updateDoc(doc(db, 'users', user.id), {
        measurements: updatedMeasurements,
        updatedAt: new Date().toISOString()
      });

      setMeasurements(updatedMeasurements);
      toast.success('Mesure supprimée !');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Fonction pour formater la date au format jour/mois
  const formatDateForChart = (dateString: string) => {
    // Si la date est déjà au format JJ/MM, on la retourne telle quelle
    if (dateString.match(/^\d{2}\/\d{2}$/)) {
      return dateString;
    }
    // Si la date est au format complet JJ/MM/AAAA, on extrait JJ/MM
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateString.substring(0, 5);
    }
    // Sinon, on essaie de parser et reformater
    try {
      const parts = dateString.split('/');
      if (parts.length >= 2) {
        return `${parts[0]}/${parts[1]}`;
      }
    } catch (error) {
      console.warn('Format de date non reconnu:', dateString);
    }
    return dateString;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mesures Corporelles</h1>
          <p className="text-gray-600">Suivi des mesures et calcul du taux de masse grasse</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit'
          })}</span>
        </div>
      </div>

      {/* Section Pesée */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ScaleIcon className="h-5 w-5 mr-2" />
          Pesée hebdomadaire
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poids actuel (kg)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={currentWeight.weight || ''}
              onChange={(e) => setCurrentWeight(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              className="input-field"
              placeholder="Votre poids en kg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (optionnel)
            </label>
            <input
              type="text"
              value={currentWeight.note}
              onChange={(e) => setCurrentWeight(prev => ({ ...prev, note: e.target.value }))}
              className="input-field"
              placeholder="Commentaire sur la pesée..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            onClick={addWeightEntry}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              height: '42px',
              border: 'none',
              fontSize: '14px'
            }}
            disabled={!currentWeight.weight}
          >
            Enregistrer
          </button>

          {weightEntries.length > 0 && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-center" style={{ height: '42px', padding: '0 16px', width: '100%' }}>
              <p className="text-sm font-medium text-blue-900 whitespace-nowrap text-center">
                Dernière pesée: {weightEntries[weightEntries.length - 1]?.weight} kg - {formatDateForChart(weightEntries[weightEntries.length - 1]?.date || '')}
              </p>
            </div>
          )}
        </div>

        {/* Graphique d'évolution du poids */}
        {weightEntries.length > 1 && (
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">📈 Évolution du poids</h4>
            <div className="h-56 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200" style={{ padding: '8px 8px 8px 8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightEntries.map(w => ({ ...w, date: formatDateForChart(w.date) }))} margin={{ top: 60, right: 40, left: 60, bottom: 15 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#fed7aa" opacity={0.6} />
                  <XAxis
                    dataKey="date"
                    tick={{ dy: 10, fontSize: 12, fill: '#4b5563' }}
                    height={60}
                    axisLine={{ stroke: '#f97316', strokeWidth: 2 }}
                    tickLine={{ stroke: '#f97316' }}
                  />
                  <YAxis
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                    axisLine={{ stroke: '#f97316', strokeWidth: 2 }}
                    tickLine={{ stroke: '#f97316' }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} kg`, 'Poids']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '2px solid #10b981',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
                    }}
                    labelStyle={{ color: '#065f46', fontWeight: 'bold' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="url(#weightLineGradient)"
                    strokeWidth={4}
                    dot={{
                      fill: '#ffffff',
                      stroke: '#10b981',
                      strokeWidth: 3,
                      r: 6,
                      filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))'
                    }}
                    activeDot={{
                      r: 8,
                      fill: '#10b981',
                      stroke: '#ffffff',
                      strokeWidth: 3,
                      filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.4))'
                    }}
                    name="Poids (kg)"
                    fill="url(#weightGradient)"
                  />
                  <defs>
                    <linearGradient id="weightLineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Historique des pesées */}
        {weightEntries.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-2">Historique des pesées</h4>
            <div className="max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {weightEntries.slice().reverse().map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                    {editingWeightId === entry.id ? (
                      // Mode édition
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                        <input
                          type="number"
                          step="0.1"
                          value={editWeightForm?.weight || ''}
                          onChange={(e) => setEditWeightForm(prev => prev ? { ...prev, weight: parseFloat(e.target.value) || 0 } : null)}
                          className="input-field text-sm"
                          placeholder="Poids"
                        />
                        <input
                          type="text"
                          value={editWeightForm?.note || ''}
                          onChange={(e) => setEditWeightForm(prev => prev ? { ...prev, note: e.target.value } : null)}
                          className="input-field text-sm"
                          placeholder="Note"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEditWeight}
                            className="p-1 text-green-600 hover:text-green-800 bg-transparent border-none"
                            style={{ background: 'transparent', border: 'none', outline: 'none' }}
                            title="Sauvegarder"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEditWeight}
                            className="p-1 text-red-600 hover:text-red-800 bg-transparent border-none"
                            style={{ background: 'transparent', border: 'none', outline: 'none' }}
                            title="Annuler"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Mode affichage
                      <>
                        <div className="flex-1">
                          <span className="font-medium">{entry.weight} kg</span>
                          {entry.note && <span className="text-sm text-gray-600 ml-2">- {entry.note}</span>}
                          <div className="text-xs text-gray-500">{formatDateForChart(entry.date)}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditWeight(entry)}
                            className="p-1 text-blue-600 hover:text-blue-800 bg-transparent border-none"
                            style={{ background: 'transparent', border: 'none', outline: 'none' }}
                            title="Modifier"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteWeight(entry.id)}
                            className="p-1 text-red-600 hover:text-red-800 bg-transparent border-none"
                            style={{ background: 'transparent', border: 'none', outline: 'none' }}
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
              type="text"
              inputMode="decimal"
              value={currentMeasurement.biceps || ''}
              onChange={(e) => handleInputChange('biceps', parseFloat(e.target.value) || 0)}
              className="input-field"
              placeholder="Mesure en mm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Triceps (en mm)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={currentMeasurement.triceps || ''}
              onChange={(e) => handleInputChange('triceps', parseFloat(e.target.value) || 0)}
              className="input-field"
              placeholder="Mesure en mm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sous-scapulaire (en mm)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={currentMeasurement.souScapulaire || ''}
              onChange={(e) => handleInputChange('souScapulaire', parseFloat(e.target.value) || 0)}
              className="input-field"
              placeholder="Mesure en mm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supra-iliaque (en mm)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={currentMeasurement.supraIliaque || ''}
              onChange={(e) => handleInputChange('supraIliaque', parseFloat(e.target.value) || 0)}
              className="input-field"
              placeholder="Mesure en mm"
            />
          </div>
        </div>

        {/* Résultats calculés */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900">Total des 4 plis</p>
            <p className="text-2xl font-bold text-blue-600">
              {(currentMeasurement.biceps + currentMeasurement.triceps +
                currentMeasurement.souScapulaire + currentMeasurement.supraIliaque).toFixed(2)} mm
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
          style={{ width: 'auto', padding: '0.375rem 1rem' }}
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

          <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200" style={{ padding: '8px 8px 8px 8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={measurements.map(m => ({ ...m, date: formatDateForChart(m.date) }))} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#fed7aa" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  tick={{ dy: 10, fontSize: 12, fill: '#4b5563' }}
                  height={60}
                  axisLine={{ stroke: '#f97316', strokeWidth: 2 }}
                  tickLine={{ stroke: '#f97316' }}
                />
                <YAxis
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 12, fill: '#4b5563' }}
                  axisLine={{ stroke: '#f97316', strokeWidth: 2 }}
                  tickLine={{ stroke: '#f97316' }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Masse grasse']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
                  }}
                  labelStyle={{ color: '#065f46', fontWeight: 'bold' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="massGrasse"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{
                    fill: '#ffffff',
                    stroke: '#10b981',
                    strokeWidth: 3,
                    r: 6,
                    filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))'
                  }}
                  activeDot={{
                    r: 8,
                    fill: '#10b981',
                    stroke: '#ffffff',
                    strokeWidth: 3,
                    filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.4))'
                  }}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {measurements.map((measurement) => (
                  <tr key={measurement.id}>
                    {editingMeasurementId === measurement.id ? (
                      // Mode édition
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {measurement.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.1"
                            value={editMeasurementForm?.biceps || ''}
                            onChange={(e) => setEditMeasurementForm(prev => prev ? { ...prev, biceps: parseFloat(e.target.value) || 0 } : null)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.1"
                            value={editMeasurementForm?.triceps || ''}
                            onChange={(e) => setEditMeasurementForm(prev => prev ? { ...prev, triceps: parseFloat(e.target.value) || 0 } : null)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.1"
                            value={editMeasurementForm?.souScapulaire || ''}
                            onChange={(e) => setEditMeasurementForm(prev => prev ? { ...prev, souScapulaire: parseFloat(e.target.value) || 0 } : null)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.1"
                            value={editMeasurementForm?.supraIliaque || ''}
                            onChange={(e) => setEditMeasurementForm(prev => prev ? { ...prev, supraIliaque: parseFloat(e.target.value) || 0 } : null)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {editMeasurementForm ? (editMeasurementForm.biceps + editMeasurementForm.triceps + editMeasurementForm.souScapulaire + editMeasurementForm.supraIliaque).toFixed(2) : '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                          {editMeasurementForm ? calculateBodyFat(
                            editMeasurementForm.biceps + editMeasurementForm.triceps + editMeasurementForm.souScapulaire + editMeasurementForm.supraIliaque,
                            userInfo.age, userInfo.gender
                          ).toFixed(1) : 0}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={saveEditMeasurement}
                              className="p-1 text-green-600 hover:text-green-800 bg-transparent border-none"
                              style={{ background: 'transparent', border: 'none', outline: 'none' }}
                              title="Sauvegarder"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEditMeasurement}
                              className="p-1 text-red-600 hover:text-red-800 bg-transparent border-none"
                              style={{ background: 'transparent', border: 'none', outline: 'none' }}
                              title="Annuler"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // Mode affichage
                      <>
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
                          {measurement.totalPlis.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                          {measurement.massGrasse}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditMeasurement(measurement)}
                              className="p-1 text-blue-600 hover:text-blue-800 bg-transparent border-none"
                              style={{ background: 'transparent', border: 'none', outline: 'none' }}
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteMeasurement(measurement.id)}
                              className="p-1 text-red-600 hover:text-red-800 bg-transparent border-none"
                              style={{ background: 'transparent', border: 'none', outline: 'none' }}
                              title="Supprimer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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
              <div className="w-full md:w-40 h-40 bg-yellow-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/images/measurements/biceps.png"
                  alt="Mesure du biceps"
                  className="w-full h-full object-contain rounded-lg"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
                <div className="hidden flex-col items-center justify-center w-full h-full">
                  <CameraIcon className="h-8 w-8 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Image Biceps</p>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800 mb-2">Biceps (en mm)</h4>
                <p className="text-sm text-yellow-700">
                  <strong>Vertical</strong> / sur le biceps à mi distance entre le pit du coude et l'avant de l'épaule
                </p>
              </div>
            </div>
          </div>

          {/* Triceps */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-40 h-40 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/images/measurements/triceps.png"
                  alt="Mesure du triceps"
                  className="w-full h-full object-contain rounded-lg"
                  onError={handleImageError}
                />
                <div className="hidden flex-col items-center justify-center w-full h-full">
                  <CameraIcon className="h-8 w-8 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Image Triceps</p>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-orange-800 mb-2">Triceps (en mm)</h4>
                <p className="text-sm text-orange-700">
                  <strong>Vertical</strong> / sur le triceps à mi distance entre le pit du coude et l'arrière de l'épaule
                </p>
              </div>
            </div>
          </div>

          {/* Sous-scapulaire */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-40 h-40 bg-green-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/images/measurements/pli-oblique.png"
                  alt="Mesure sous-scapulaire"
                  className="w-full h-full object-contain rounded-lg"
                  onError={handleImageError}
                />
                <div className="hidden flex-col items-center justify-center w-full h-full">
                  <CameraIcon className="h-8 w-8 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Image Sous-scapulaire</p>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-green-800 mb-2">Région sous scapulaire (en mm)</h4>
                <p className="text-sm text-green-700">
                  <strong>En oblique</strong> vers le bas et l'extérieur / en dessous sous la pointe de l'omoplate
                </p>
              </div>
            </div>
          </div>

          {/* Supra-iliaque */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-40 h-40 bg-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/images/measurements/supra-iliaque.png"
                  alt="Mesure supra-iliaque"
                  className="w-full h-full object-contain rounded-lg"
                  onError={handleImageError}
                />
                <div className="hidden flex-col items-center justify-center w-full h-full">
                  <CameraIcon className="h-8 w-8 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Image Supra-iliaque</p>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-purple-800 mb-2">Supra iliaque (en mm)</h4>
                <p className="text-sm text-purple-700">
                  <strong>En oblique</strong> vers le bas et l'intérieur / environ 2 cm au-dessus de la crête iliaque
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Calcul automatique</h4>
          <p className="text-sm text-blue-700">
            Le taux de masse grasse est calculé automatiquement selon la formule de Durnin & Womersley.
            Plus vous effectuez de mesures régulières, plus le graphique d'évolution sera précis pour suivre vos progrès !
          </p>
        </div>
      </div>



      {/* Tableau technique des coefficients */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          Coefficients techniques - Formule Durnin & Womersley
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hommes */}
          <div>
            <h4 className="font-medium text-blue-900 mb-3 text-center">Hommes</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-blue-900 uppercase tracking-wider border-r border-gray-300">

                    </th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-blue-900 uppercase tracking-wider border-r border-gray-300">
                      17-19
                    </th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-blue-900 uppercase tracking-wider border-r border-gray-300">
                      20-29
                    </th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-blue-900 uppercase tracking-wider border-r border-gray-300">
                      30-39
                    </th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-blue-900 uppercase tracking-wider border-r border-gray-300">
                      40-49
                    </th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-blue-900 uppercase tracking-wider">
                      &gt;50
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-2 py-2 text-sm font-bold text-blue-900 border-r border-gray-300">C</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">1,1620</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">1,1631</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">1,1422</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">1,1620</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900">1,1715</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-2 py-2 text-sm font-bold text-blue-900 border-r border-gray-300">M</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">0,0678</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">0,0632</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">0,0544</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">0,0700</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900">0,0779</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Femmes */}
          <div>
            <h4 className="font-medium text-pink-900 mb-3 text-center">Femmes</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-pink-900 uppercase tracking-wider border-r border-gray-300">

                    </th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-pink-900 uppercase tracking-wider border-r border-gray-300">
                      16-19
                    </th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-pink-900 uppercase tracking-wider border-r border-gray-300">
                      20-29
                    </th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-pink-900 uppercase tracking-wider border-r border-gray-300">
                      30-39
                    </th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-pink-900 uppercase tracking-wider border-r border-gray-300">
                      40-49
                    </th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-pink-900 uppercase tracking-wider">
                      &gt;50
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-2 py-2 text-sm font-bold text-pink-900 border-r border-gray-300">C</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">1,1549</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">1,1599</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">1,1423</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">1,1333</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900">1,1339</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-2 py-2 text-sm font-bold text-pink-900 border-r border-gray-300">M</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">0,0678</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">0,0717</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">0,0632</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900 border-r border-gray-300">0,0612</td>
                    <td className="px-2 py-2 text-sm text-center text-gray-900">0,0645</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Formule utilisée</h4>
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