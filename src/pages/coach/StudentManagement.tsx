import React, { useState, useEffect } from 'react';
import { UserGroupIcon, ChartBarIcon, EyeIcon, ChatBubbleLeftRightIcon, PencilIcon } from '@heroicons/react/24/outline';
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

interface StudentData {
  id: string;
  name: string;
  email: string;
  personalInfo?: any;
  nutritionData?: any;
  measurements?: any;
  weightEntries?: any;
  exchanges?: any[];
  lastActivity?: string;
}

interface Exchange {
  id: string;
  date: string;
  actionCoach: string;
  details: string;
  coachComment?: string;
  coachCommentDate?: string;
}

const StudentManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentingExchange, setCommentingExchange] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Charger les élèves du coach
  useEffect(() => {
    const loadStudents = async () => {
      if (!user?.id || user.role !== 'coach') return;

      try {
        // Récupérer d'abord les données du coach pour avoir la liste de ses élèves
        const coachDoc = await getDoc(doc(db, 'users', user.id));
        if (!coachDoc.exists()) {
          setStudents([]);
          return;
        }

        const coachData = coachDoc.data();
        const studentIds = coachData.students || [];

        if (studentIds.length === 0) {
          setStudents([]);
          return;
        }

        // Charger les données de chaque élève individuellement
        const studentsData: StudentData[] = [];
        for (const studentId of studentIds) {
          try {
            const studentDoc = await getDoc(doc(db, 'users', studentId));
            if (studentDoc.exists()) {
              const data = studentDoc.data();
              studentsData.push({
                id: studentDoc.id,
                name: data.name || 'Nom non renseigné',
                email: data.email || '',
                personalInfo: data.personalInfo,
                nutritionData: data.nutritionData,
                measurements: data.measurements,
                weightEntries: data.weightEntries,
                exchanges: data.exchanges || [],
                lastActivity: data.updatedAt || 'Jamais'
              });
            }
          } catch (studentError) {
            console.warn(`Impossible de charger l'élève ${studentId}:`, studentError);
          }
        }

        setStudents(studentsData);
      } catch (error) {
        console.error('Erreur lors du chargement des élèves:', error);
        toast.error('Erreur lors du chargement des élèves');
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, [user]);

  // Fonction pour ajouter un commentaire coach
  const addCoachComment = async (studentId: string, exchangeId: string) => {
    if (!commentText.trim()) {
      toast.error('Veuillez saisir un commentaire');
      return;
    }

    try {
      const studentDoc = await getDoc(doc(db, 'users', studentId));
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        const exchanges = studentData.exchanges || [];

        const updatedExchanges = exchanges.map((exchange: Exchange) =>
          exchange.id === exchangeId
            ? {
              ...exchange,
              coachComment: commentText.trim(),
              coachCommentDate: new Date().toLocaleDateString('fr-FR')
            }
            : exchange
        );

        await updateDoc(doc(db, 'users', studentId), {
          exchanges: updatedExchanges,
          updatedAt: new Date().toISOString()
        });

        // Mettre à jour l'affichage local
        setStudents(prev => prev.map(student =>
          student.id === studentId
            ? { ...student, exchanges: updatedExchanges }
            : student
        ));

        if (selectedStudent?.id === studentId) {
          setSelectedStudent(prev => prev ? { ...prev, exchanges: updatedExchanges } : null);
        }

        setCommentingExchange(null);
        setCommentText('');
        toast.success('Commentaire ajouté !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      toast.error('Erreur lors de l\'ajout du commentaire');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Élèves</h1>
        <p className="text-gray-600">Consultez les données de vos élèves</p>
      </div>

      {isLoading ? (
        <div className="card">
          <p className="text-center text-gray-500">Chargement des élèves...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aucun élève trouvé</h2>
          <p className="text-gray-600">
            Aucun élève n'est actuellement enregistré dans le système.
          </p>
        </div>
      ) : (
        <>
          {/* Liste des élèves */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Mes Élèves ({students.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <div key={student.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Voir les détails"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{student.email}</p>

                  <div className="space-y-1 text-xs text-gray-500">
                    <div>Poids: {student.personalInfo?.poidsActuel ? `${student.personalInfo.poidsActuel} kg` : 'Non renseigné'}</div>
                    <div>Nutrition: {student.nutritionData ? Object.keys(student.nutritionData).length + ' semaines' : 'Aucune donnée'}</div>
                    <div>Mesures: {student.measurements?.length || 0} entrées</div>
                    <div>Dernière activité: {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString('fr-FR') : 'Jamais'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Détails de l'élève sélectionné */}
          {selectedStudent && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Données de {selectedStudent.name}
                </h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Fermer
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Informations personnelles</h3>
                  {selectedStudent.personalInfo ? (
                    <div className="space-y-1 text-sm">
                      <div>Âge: {selectedStudent.personalInfo.age || 'Non renseigné'} ans</div>
                      <div>Poids: {selectedStudent.personalInfo.poidsActuel || 'Non renseigné'} kg</div>
                      <div>Taille: {selectedStudent.personalInfo.taille || 'Non renseigné'} cm</div>
                      <div>IMC: {selectedStudent.personalInfo.imc || 'Non calculé'}</div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aucune information personnelle</p>
                  )}
                </div>

                {/* Données nutrition */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Données nutrition</h3>
                  {selectedStudent.nutritionData ? (
                    <div className="space-y-1 text-sm">
                      <div>Semaines remplies: {Object.keys(selectedStudent.nutritionData).length}</div>
                      <div className="text-xs text-gray-600 mt-2">
                        Dernières saisies disponibles pour consultation détaillée
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aucune donnée nutrition</p>
                  )}
                </div>
              </div>

              {/* Résumé nutrition récent */}
              {selectedStudent.nutritionData && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Résumé nutrition récent</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(selectedStudent.nutritionData).slice(-4).map(([week, data]: [string, any]) => (
                      <div key={week} className="p-3 bg-gray-50 rounded border">
                        <div className="text-xs font-medium text-gray-700">Semaine {week}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {Object.values(data.nutrition || {}).filter((jour: any) =>
                            Object.values(jour).some((repas: any) => repas?.toString().trim() !== '')
                          ).length}/7 jours
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bilan des échanges */}
              {selectedStudent.exchanges && selectedStudent.exchanges.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Bilan des échanges ({selectedStudent.exchanges.length})
                  </h3>

                  <div className="space-y-4">
                    {selectedStudent.exchanges.map((exchange: Exchange) => (
                      <div key={exchange.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              Échange du {exchange.date}
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{exchange.actionCoach}</p>
                          </div>
                        </div>

                        {/* Commentaire coach */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {exchange.coachComment ? (
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-medium text-blue-900">Votre commentaire :</span>
                                <button
                                  onClick={() => {
                                    setCommentingExchange(exchange.id);
                                    setCommentText(exchange.coachComment || '');
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Modifier le commentaire"
                                >
                                  <PencilIcon className="h-3 w-3" />
                                </button>
                              </div>
                              <p className="text-sm text-blue-800">{exchange.coachComment}</p>
                              <p className="text-xs text-blue-600 mt-1">{exchange.coachCommentDate}</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <button
                                onClick={() => {
                                  setCommentingExchange(exchange.id);
                                  setCommentText('');
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                + Ajouter un commentaire coach
                              </button>
                            </div>
                          )}

                          {/* Formulaire de commentaire */}
                          {commentingExchange === exchange.id && (
                            <div className="mt-3 p-3 bg-gray-50 rounded border">
                              <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Votre commentaire en tant que coach..."
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => addCoachComment(selectedStudent.id, exchange.id)}
                                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                  disabled={!commentText.trim()}
                                >
                                  Enregistrer
                                </button>
                                <button
                                  onClick={() => {
                                    setCommentingExchange(null);
                                    setCommentText('');
                                  }}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentManagement; 