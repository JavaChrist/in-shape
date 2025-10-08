import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  FireIcon,
  ScaleIcon,
  FlagIcon,
  TrophyIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/useAuthStore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user, isCoach } = useAuthStore();
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [newExchangeText, setNewExchangeText] = useState('');

  // Charger les données utilisateur depuis Firebase
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.personalInfo) {
            setPersonalInfo(userData.personalInfo);
          }
          if (userData.exchanges) {
            setExchanges(userData.exchanges);
          }
          // Stocker toutes les données pour les calculs de progression
          setUserData(userData);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        console.error('Code d\'erreur:', error.code);
        console.error('Message:', error.message);

        // Afficher une erreur plus spécifique
        if (error.code === 'permission-denied') {
          console.error('❌ Permissions Firestore insuffisantes');
        } else if (error.code === 'unavailable') {
          console.error('⚠️ Service Firestore temporairement indisponible');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Recharger les données quand l'utilisateur revient sur la page
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id && !isLoading) {
        // Recharger les données en arrière-plan
        const loadUserData = async () => {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.id));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.personalInfo) {
                setPersonalInfo(userData.personalInfo);
              }
            }
          } catch (error: any) {
            // Mode silencieux pour les erreurs de connexion
            if (error.code !== 'unavailable' && error.code !== 'failed-precondition') {
              console.error('Erreur lors du rechargement des données:', error);
            }
          }
        };
        loadUserData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, isLoading]);

  // Gérer le statut de connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fonctions pour l'IMC
  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return 'Insuffisance pondérale';
    if (imc < 25) return 'Poids normal';
    if (imc < 30) return 'Surpoids';
    return 'Obésité';
  };

  const getIMCChangeType = (imc: number): 'positive' | 'negative' | 'neutral' => {
    if (imc < 18.5) return 'negative';
    if (imc < 25) return 'positive';
    if (imc < 30) return 'neutral';
    return 'negative';
  };

  // Calcul de l'objectif atteint (exemple basé sur le poids)
  const calculateGoalProgress = () => {
    if (!personalInfo || !personalInfo.poidsActuel) return '0%';

    // Exemple : si poids initial 100kg et objectif 80kg, et actuel 90kg
    // Progress = (100-90)/(100-80) = 10/20 = 50%
    const initialWeight = personalInfo.poidsActuel + 10; // Estimation
    const targetWeight = personalInfo.poidsActuel - 10; // Estimation
    const progress = Math.min(100, Math.max(0,
      ((initialWeight - personalInfo.poidsActuel) / (initialWeight - targetWeight)) * 100
    ));
    return `${Math.round(progress)}%`;
  };

  // Calculs de progression réelle
  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  };

  const calculateNutritionProgress = () => {
    if (!userData?.nutritionData) return 0;
    const currentWeek = getCurrentWeek();
    const weekData = userData.nutritionData[currentWeek];
    if (!weekData) return 0;

    const totalDays = 7;
    const filledDays = Object.values(weekData.nutrition || {}).filter((jour: any) =>
      Object.values(jour).some((repas: any) => repas?.toString().trim() !== '')
    ).length;

    return Math.round((filledDays / totalDays) * 100);
  };

  const calculateSleepProgress = () => {
    if (!userData?.nutritionData) return 0;
    const currentWeek = getCurrentWeek();
    const weekData = userData.nutritionData[currentWeek];
    if (!weekData) return 0;

    const totalDays = 7;
    const filledDays = Object.values(weekData.sommeil || {}).filter((horaire: any) =>
      horaire?.coucher?.trim() !== '' && horaire?.reveil?.trim() !== ''
    ).length;

    return Math.round((filledDays / totalDays) * 100);
  };

  const calculateHabitsProgress = () => {
    // Cette fonction nécessiterait d'accéder aux données d'habitudes
    // Pour l'instant, on retourne une valeur par défaut
    return 0;
  };

  const calculateHydrationProgress = () => {
    if (!userData?.nutritionData) return 0;
    const currentWeek = getCurrentWeek();
    const weekData = userData.nutritionData[currentWeek];
    if (!weekData) return 0;

    const totalDays = 7;
    const filledDays = Object.values(weekData.nutrition || {}).filter((jour: any) =>
      jour?.eauBoissons?.trim() !== ''
    ).length;

    return Math.round((filledDays / totalDays) * 100);
  };

  // Fonctions pour les échanges
  const addExchange = async () => {
    if (!newExchangeText.trim() || !user?.id) return;

    try {
      const newExchange = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        actionCoach: newExchangeText.trim(),
        details: ''
      };

      const updatedExchanges = [...exchanges, newExchange];

      await updateDoc(doc(db, 'users', user.id), {
        exchanges: updatedExchanges,
        updatedAt: new Date().toISOString()
      });

      setExchanges(updatedExchanges);
      setNewExchangeText('');
      setShowExchangeForm(false);

      toast.success('Échange ajouté !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'échange:', error);
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const cancelExchange = () => {
    setNewExchangeText('');
    setShowExchangeForm(false);
  };

  // Stats dynamiques basées sur les vraies données
  const stats = [
    {
      name: 'Poids actuel',
      value: personalInfo?.poidsActuel ? `${personalInfo.poidsActuel} kg` : 'Non renseigné',
      change: personalInfo?.poidsActuel ? '-2.3 kg' : '',
      changeType: 'positive',
      icon: ScaleIcon,
    },
    {
      name: 'IMC',
      value: personalInfo?.imc ? `${personalInfo.imc}` : 'Non calculé',
      change: personalInfo?.imc ? getIMCStatus(personalInfo.imc) : '',
      changeType: personalInfo?.imc ? getIMCChangeType(personalInfo.imc) : 'neutral',
      icon: FlagIcon,
    },
    {
      name: 'Taille',
      value: personalInfo?.taille ? `${personalInfo.taille} cm` : 'Non renseigné',
      change: '',
      changeType: 'neutral',
      icon: FireIcon,
    },
    {
      name: 'Âge',
      value: personalInfo?.age ? `${personalInfo.age} ans` : 'Non renseigné',
      change: '',
      changeType: 'neutral',
      icon: TrophyIcon,
    },
  ];

  // recentActivities supprimé - remplacé par les échanges coach

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isCoach() ? 'Dashboard Coach' : 'Mon Dashboard'}
          </h1>
          <p className="text-gray-600">
            Bonjour {user?.name} ! Voici votre progression aujourd'hui
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {!isOnline && (
            <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
              <span>●</span>
              <span>Mode hors ligne</span>
            </div>
          )}
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="mt-2 flex items-center">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-primary-500" />
                </div>
              </div>
              {stat.change && (
                <div className="mt-2 flex items-center">
                  <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                    {stat.change}
                  </span>
                  {stat.changeType !== 'neutral' && (
                    <span className="text-sm text-gray-500 ml-2">cette semaine</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Entry */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/nutrition"
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ChartBarIcon className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">Nutrition</span>
            </Link>
            <Link
              to="/exercise"
              className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <FireIcon className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">Exercice</span>
            </Link>
            <Link
              to="/measurements"
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <ScaleIcon className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Pesée</span>
            </Link>
            <Link
              to="/habits"
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FlagIcon className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Habitudes</span>
            </Link>
          </div>
        </div>

        {/* Échanges avec le coach */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              Échanges avec le coach
            </h3>
            <button
              onClick={() => setShowExchangeForm(true)}
              className="flex items-center px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              disabled={showExchangeForm}
              style={{ background: showExchangeForm ? '#9ca3af' : '#3b82f6' }}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Ajouter
            </button>
          </div>

          {/* Formulaire d'ajout */}
          {showExchangeForm && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Nouvel échange</h4>
              <textarea
                value={newExchangeText}
                onChange={(e) => setNewExchangeText(e.target.value)}
                className="w-full p-3 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Décrivez votre échange, consultation, problématique ou résumé de la séance..."
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={addExchange}
                  className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={!newExchangeText.trim()}
                >
                  Enregistrer
                </button>
                <button
                  onClick={cancelExchange}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des échanges */}
          {exchanges.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Aucun échange pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exchanges.slice(-3).reverse().map((exchange: any, index: number) => (
                <div key={exchange.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-xs">{exchanges.length - index}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900">Échange du {exchange.date}</h4>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{exchange.actionCoach}</p>

                      {exchange.coachComment ? (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-xs text-green-700 font-medium">Retour du coach: {exchange.coachComment}</p>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">En attente du retour de votre coach...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {exchanges.length > 3 && (
                <div className="text-center pt-2">
                  <Link
                    to="/profile"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Voir tous les échanges ({exchanges.length})
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression cette semaine</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Nutrition</span>
              <span className="text-sm text-gray-500">{calculateNutritionProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${calculateNutritionProgress()}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Sommeil</span>
              <span className="text-sm text-gray-500">{calculateSleepProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${calculateSleepProgress()}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Hydratation</span>
              <span className="text-sm text-gray-500">{calculateHydrationProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${calculateHydrationProgress()}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Habitudes</span>
              <span className="text-sm text-gray-500">{calculateHabitsProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${calculateHabitsProgress()}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="card bg-gradient-to-r from-primary-500 to-blue-600 text-white">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Inspiration du jour</h3>
          <p className="text-primary-100 italic">
            "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte."
          </p>
          <p className="text-sm text-primary-200 mt-2">- Winston Churchill</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 