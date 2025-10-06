import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { User } from '../types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
  name?: string;
  role?: 'student' | 'coach';
  confirmPassword?: string;
  coachCode?: string; // Code du coach pour les élèves
}

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { login } = useAuthStore();

  // Cleanup pour éviter les erreurs de listeners asynchrones
  React.useEffect(() => {
    return () => {
      // Cleanup des états lors du démontage du composant
    };
  }, []);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      if (isLogin) {
        // Connexion
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'id'>;
          const user: User = {
            id: userCredential.user.uid,
            ...userData,
          };
          login(user);
          toast.success(`Bienvenue ${user.name} !`);
        } else {
          throw new Error('Données utilisateur introuvables');
        }
      } else {
        // Inscription
        if (data.password !== data.confirmPassword) {
          toast.error('Les mots de passe ne correspondent pas');
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

        // Si c'est un élève, vérifier le code coach
        let coachId = undefined;
        if (data.role === 'student' && data.coachCode) {
          // Chercher le coach avec ce code
          const coachQuery = query(collection(db, 'users'),
            where('role', '==', 'coach'),
            where('coachCode', '==', data.coachCode)
          );
          const coachSnapshot = await getDocs(coachQuery);

          if (coachSnapshot.empty) {
            throw new Error('Code coach invalide');
          }

          coachId = coachSnapshot.docs[0].id;
        }

        const newUser: User = {
          id: userCredential.user.uid,
          email: data.email,
          name: data.name!,
          role: data.role!,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...(data.role === 'student' && coachId && { coachId }),
          ...(data.role === 'coach' && {
            coachCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            isVerified: false
          })
        };

        // Sauvegarder dans Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...newUser,
          createdAt: newUser.createdAt.toISOString(),
          updatedAt: newUser.updatedAt.toISOString(),
        });

        // Si c'est un élève, ajouter à la liste du coach
        if (data.role === 'student' && coachId) {
          const coachDoc = await getDoc(doc(db, 'users', coachId));
          if (coachDoc.exists()) {
            const coachData = coachDoc.data();
            const currentStudents = coachData.students || [];
            await updateDoc(doc(db, 'users', coachId), {
              students: [...currentStudents, userCredential.user.uid],
              updatedAt: new Date().toISOString()
            });
          }
        }

        login(newUser);
        if (data.role === 'coach') {
          toast.success(`Compte coach créé ! Votre code est : ${(newUser as any).coachCode}`, {
            duration: 8000
          });
        } else {
          toast.success(`Compte créé avec succès ! Bienvenue ${newUser.name} !`);
        }
      }
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('Aucun compte trouvé avec cet email');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Mot de passe incorrect');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('Un compte existe déjà avec cet email');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Le mot de passe doit contenir au moins 6 caractères');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Identifiants invalides. Vérifiez votre email et mot de passe.');
      } else if (error.code === 'auth/invalid-api-key') {
        toast.error('Configuration Firebase incorrecte. Contactez l\'administrateur.');
      } else if (error.message === 'Code coach invalide') {
        toast.error('Code coach invalide. Vérifiez le code fourni par votre coach.');
      } else {
        toast.error('Erreur d\'authentification. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error('Veuillez saisir votre adresse email');
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('Aucun compte trouvé avec cet email');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Adresse email invalide');
      } else if (error.code === 'auth/invalid-api-key') {
        toast.error('Configuration Firebase incorrecte. Contactez l\'administrateur.');
      } else {
        toast.error('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.');
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo192.png" alt="InShape Logo" className="h-16 w-16" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              InShape
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    {...register('name', {
                      required: !isLogin ? 'Le nom est requis' : false
                    })}
                    type="text"
                    className="input-field"
                    placeholder="Votre nom complet"
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Vous êtes
                  </label>
                  <select
                    {...register('role', {
                      required: !isLogin ? 'Le rôle est requis' : false
                    })}
                    className="input-field"
                  >
                    <option value="">Sélectionnez votre rôle</option>
                    <option value="student">Élève</option>
                    <option value="coach">Coach</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>

                {watch('role') === 'student' && (
                  <div>
                    <label htmlFor="coachCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Code du coach
                    </label>
                    <input
                      {...register('coachCode', {
                        required: watch('role') === 'student' ? 'Le code du coach est requis pour les élèves' : false
                      })}
                      type="text"
                      className="input-field"
                      placeholder="Code fourni par votre coach"
                      autoComplete="off"
                    />
                    {errors.coachCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.coachCode.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Demandez ce code à votre coach personnel
                    </p>
                  </div>
                )}
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                {...register('email', {
                  required: 'L\'email est requis',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Email invalide'
                  }
                })}
                type="email"
                className="input-field"
                placeholder="votre@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 6,
                      message: 'Le mot de passe doit contenir au moins 6 caractères'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center text-gray-400 hover:text-gray-600"
                  style={{ background: 'transparent', border: 'none', padding: '0 12px 0 8px', width: 'auto', outline: 'none', boxShadow: 'none' }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword', {
                      required: !isLogin ? 'Veuillez confirmer votre mot de passe' : false,
                      validate: (value) => !isLogin ? value === watch('password') || 'Les mots de passe ne correspondent pas' : true
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center text-gray-400 hover:text-gray-600"
                    style={{ background: 'transparent', border: 'none', padding: '0 12px 0 8px', width: 'auto', outline: 'none', boxShadow: 'none' }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                isLogin ? 'Se connecter' : 'Créer le compte'
              )}
            </button>

            <div className="text-center space-y-2">
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Mot de passe oublié ?
                </button>
              )}
              <button
                type="button"
                onClick={toggleMode}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {isLogin
                  ? 'Pas encore de compte ? Créez-en un'
                  : 'Déjà un compte ? Connectez-vous'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Transformez votre corps, atteignez vos objectifs !
          </p>
        </div>
      </div>

      {/* Modale Mot de passe oublié */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Réinitialiser le mot de passe
            </h3>
            <p className="text-gray-600 mb-4">
              Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            <div className="mb-4">
              <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="input-field"
                placeholder="votre@email.com"
                autoComplete="email"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isResetting}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="flex-1 btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isResetting ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  'Envoyer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login; 