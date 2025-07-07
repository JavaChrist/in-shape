import React, { useState, useEffect } from 'react';
import { UserIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, ScaleIcon, ChatBubbleLeftRightIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';

interface PersonalInfo {
  email: string;
  telephone: string;
  age: number;
  poidsActuel: number;
  taille: number;
  tourTaille: number;
  imc: number;
  infoComplementaire: string;
}

interface MissionTransformation {
  objectif: string;
  pourquoi: string;
  avantages: string;
  changements: string;
}

interface Exchange {
  id: string;
  date: string;
  actionCoach: string;
  details: string;
}



const Profile: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    email: 'contact@exemple.fr',
    telephone: '06.06.06.06',
    age: 30,
    poidsActuel: 70.5,
    taille: 175,
    tourTaille: 85,
    imc: 23.0,
    infoComplementaire: ''
  });

  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<PersonalInfo>(personalInfo);
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [newExchangeText, setNewExchangeText] = useState('');

  const [missionTransformation, setMissionTransformation] = useState<MissionTransformation>({
    objectif: "Je veux perdre 50 kg pour retrouver la forme, arrêter de vivre sous antidouleurs, et pouvoir refaire du sport, notamment courir, ce que j'adorais, et réaliser mon rêve : faire du parapente.",
    pourquoi: "Parce que je suis en surcharge pondérale sévère depuis plusieurs années, avec des douleurs au dos constantes. Je prends des antidouleurs 3 fois par jour depuis 5 ans. Je ne peux pas marcher plus de 5 minutes sans souffrir, et je sens que le passé à côté de ma vie. Aujourd'hui je veux changer ça. C'est devenu vital pour moi. Je veux retrouver mon corps, ma liberté, et surtout profiter à nouveau de la vie.",
    avantages: "• Soulager mes douleurs au dos et arrêter les antidouleurs\n• Recommencer à marcher, à courir, à faire du sport\n• Être plus autonome et solide au quotidien\n• Reprendre confiance en soi\n• Réaliser mon rêve : faire du parapente\n• Me sentir mieux dans mon corps, mon mental, et ma peau",
    changements: "• Revoir totalement mon alimentation avec ton aide\n• Me mettre en mouvement même si c'est dur au début, quelques minutes chaque jour\n• M'investir dans le programme avec régularité et honnêteté, sans me mentir\n• Me faire confiance, et faire confiance au processus\n• Être patient, mais ne plus jamais lâcher"
  });
  const [isEditingMission, setIsEditingMission] = useState(false);
  const [editMissionForm, setEditMissionForm] = useState<MissionTransformation>(missionTransformation);

  // Calcul automatique de l'IMC
  useEffect(() => {
    if (personalInfo.taille > 0 && personalInfo.poidsActuel > 0) {
      const tailleM = personalInfo.taille / 100;
      const imc = personalInfo.poidsActuel / (tailleM * tailleM);
      setPersonalInfo(prev => ({ ...prev, imc: Math.round(imc * 10) / 10 }));
    }
  }, [personalInfo.taille, personalInfo.poidsActuel]);

  const handleEdit = () => {
    setEditForm(personalInfo);
    setIsEditing(true);
  };

  const handleSave = () => {
    setPersonalInfo(editForm);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof PersonalInfo, value: string | number) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const addExchange = () => {
    if (newExchangeText.trim()) {
      const newExchange: Exchange = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('fr-FR'),
        actionCoach: newExchangeText.trim(),
        details: ''
      };
      setExchanges(prev => [...prev, newExchange]);
      setNewExchangeText('');
      setShowExchangeForm(false);
    }
  };

  const cancelExchange = () => {
    setNewExchangeText('');
    setShowExchangeForm(false);
  };

  const handleEditMission = () => {
    setEditMissionForm(missionTransformation);
    setIsEditingMission(true);
  };

  const handleSaveMission = () => {
    setMissionTransformation(editMissionForm);
    setIsEditingMission(false);
  };

  const handleMissionInputChange = (field: keyof MissionTransformation, value: string) => {
    setEditMissionForm(prev => ({ ...prev, [field]: value }));
  };



  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { text: 'Insuffisance pondérale', color: 'text-blue-600' };
    if (imc < 25) return { text: 'Poids normal', color: 'text-green-600' };
    if (imc < 30) return { text: 'Surpoids', color: 'text-orange-600' };
    return { text: 'Obésité', color: 'text-red-600' };
  };

  const imcStatus = getIMCStatus(personalInfo.imc);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Personnel</h1>
          <p className="text-gray-600">Présentation de votre espace drive - PAPA IN SHAPE V</p>
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

      {/* Informations personnelles */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Informations personnelles
          </h3>
          <button
            onClick={isEditing ? handleSave : handleEdit}
            className={`btn-sm ${isEditing ? 'btn-primary' : 'btn-secondary'}`}
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            {isEditing ? 'Enregistrer' : 'Modifier'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <EnvelopeIcon className="h-4 w-4 inline mr-1" />
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input-field"
              />
            ) : (
              <p className="text-gray-900 font-medium">{personalInfo.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <PhoneIcon className="h-4 w-4 inline mr-1" />
              Téléphone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                className="input-field"
              />
            ) : (
              <p className="text-gray-900 font-medium">{personalInfo.telephone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Age
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editForm.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                className="input-field"
              />
            ) : (
              <p className="text-gray-900 font-medium">{personalInfo.age} ans</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <ScaleIcon className="h-4 w-4 inline mr-1" />
              Poids Actuel
            </label>
            {isEditing ? (
              <input
                type="number"
                step="0.1"
                value={editForm.poidsActuel}
                onChange={(e) => handleInputChange('poidsActuel', parseFloat(e.target.value) || 0)}
                className="input-field"
              />
            ) : (
              <p className="text-gray-900 font-medium">{personalInfo.poidsActuel} kg</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📏 Taille
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editForm.taille}
                onChange={(e) => handleInputChange('taille', parseInt(e.target.value) || 0)}
                className="input-field"
              />
            ) : (
              <p className="text-gray-900 font-medium">{personalInfo.taille} cm</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📐 Tour de taille
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editForm.tourTaille}
                onChange={(e) => handleInputChange('tourTaille', parseInt(e.target.value) || 0)}
                className="input-field"
              />
            ) : (
              <p className="text-gray-900 font-medium">{personalInfo.tourTaille} cm</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🧮 IMC
            </label>
            <p className={`font-bold ${imcStatus.color}`}>
              {personalInfo.imc}
            </p>
            <p className={`text-xs ${imcStatus.color}`}>
              {imcStatus.text}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ℹ️ Info complémentaire
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.infoComplementaire}
                onChange={(e) => handleInputChange('infoComplementaire', e.target.value)}
                className="input-field"
                placeholder="Allergies, pathologies..."
              />
            ) : (
              <p className="text-gray-900 font-medium">
                {personalInfo.infoComplementaire || 'Aucune'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mission transformation */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🚀 Mission transformation {'>> POUR TE GUIDER'}
          </h3>
          <button
            onClick={isEditingMission ? handleSaveMission : handleEditMission}
            className={`btn-sm ${isEditingMission ? 'btn-primary' : 'btn-secondary'}`}
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            {isEditingMission ? 'Enregistrer' : 'Modifier'}
          </button>
        </div>

        <div className="space-y-6">
          {/* 1. Décris ton objectif */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">📋 Décris ton objectif</h4>
            {isEditingMission ? (
              <textarea
                value={editMissionForm.objectif}
                onChange={(e) => handleMissionInputChange('objectif', e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Ex: Je veux perdre 50 kg pour retrouver la forme, arrêter de vivre sous antidouleurs..."
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded border min-h-[80px]">
                <p className="text-gray-900 whitespace-pre-line">
                  {missionTransformation.objectif}
                </p>
              </div>
            )}
          </div>

          {/* 2. Pourquoi tu veux atteindre ton objectif */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">💭 Note Pourquoi tu veux atteindre ton objectif</h4>
            {isEditingMission ? (
              <textarea
                value={editMissionForm.pourquoi}
                onChange={(e) => handleMissionInputChange('pourquoi', e.target.value)}
                className="input-field"
                rows={4}
                placeholder="Expliquez pourquoi vous voulez atteindre cet objectif..."
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded border min-h-[100px]">
                <p className="text-gray-900 text-sm whitespace-pre-line">
                  {missionTransformation.pourquoi}
                </p>
              </div>
            )}
          </div>

          {/* 3. Grands avantages */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">✨ Quels sont les grands avantages / bénéfices que tu vas retirer de ta perte de poids ?</h4>
            {isEditingMission ? (
              <textarea
                value={editMissionForm.avantages}
                onChange={(e) => handleMissionInputChange('avantages', e.target.value)}
                className="input-field"
                rows={6}
                placeholder="Listez les avantages et bénéfices (un par ligne avec •)..."
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded border min-h-[120px]">
                <div className="text-gray-900 text-sm whitespace-pre-line">
                  {missionTransformation.avantages}
                </div>
              </div>
            )}
          </div>

          {/* 4. Changements d'habitudes */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">🔄 Quels sont les changements d'habitudes pour atteindre ton objectif ?</h4>
            {isEditingMission ? (
              <textarea
                value={editMissionForm.changements}
                onChange={(e) => handleMissionInputChange('changements', e.target.value)}
                className="input-field"
                rows={5}
                placeholder="Listez les changements d'habitudes nécessaires (un par ligne avec •)..."
              />
            ) : (
              <div className="bg-gray-50 p-3 rounded border min-h-[100px]">
                <div className="text-gray-900 text-sm whitespace-pre-line">
                  {missionTransformation.changements}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bilan des échanges */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
            Bilan des échanges
          </h3>
          <button
            onClick={() => setShowExchangeForm(true)}
            className="btn-sm btn-primary"
            disabled={showExchangeForm}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Ajouter un échange
          </button>
        </div>

        {/* Formulaire de saisie d'échange */}
        {showExchangeForm && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Nouvel échange avec le coach</h4>
            <textarea
              value={newExchangeText}
              onChange={(e) => setNewExchangeText(e.target.value)}
              className="input-field mb-3"
              rows={4}
              placeholder="Décrivez votre échange, consultation, problématique ou résumé de la séance avec le coach..."
            />
            <div className="flex space-x-2">
              <button onClick={addExchange} className="btn-sm btn-primary" disabled={!newExchangeText.trim()}>
                Enregistrer l'échange
              </button>
              <button onClick={cancelExchange} className="btn-sm btn-secondary">
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Échange
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions du coach - Resumé des consultations problématiques
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exchanges.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    Aucun échange pour le moment
                  </td>
                </tr>
              ) : (
                exchanges.map((exchange, index) => (
                  <tr key={exchange.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exchange.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {exchange.actionCoach}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* Lien vers l'espace formation */}
      <div className="card">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">
            {'>> ÉTAPE 1 : Clique pour regarder la courte vidéo (important) <<'}
          </h3>
          <p className="text-primary-100 mb-4">
            {'>> LIEN DE TON ESPACE FORMATION ->'}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-green-300 font-medium">Révision transformation</span>
            <span className="text-primary-200">{'-> POUR TE CUISINER'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 