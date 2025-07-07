import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { User } from '../types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface LoginFormData {
  email: string;
  password: string;
  name?: string;
  role?: 'student' | 'coach';
  confirmPassword?: string;
}

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

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

        const newUser: User = {
          id: userCredential.user.uid,
          email: data.email,
          name: data.name!,
          role: data.role!,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Sauvegarder dans Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...newUser,
          createdAt: newUser.createdAt.toISOString(),
          updatedAt: newUser.updatedAt.toISOString(),
        });

        login(newUser);
        toast.success(`Compte créé avec succès ! Bienvenue ${newUser.name} !`);
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
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                {...register('password', {
                  required: 'Le mot de passe est requis',
                  minLength: {
                    value: 6,
                    message: 'Le mot de passe doit contenir au moins 6 caractères'
                  }
                })}
                type="password"
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  {...register('confirmPassword', {
                    required: !isLogin ? 'Veuillez confirmer votre mot de passe' : false,
                    validate: (value) => !isLogin ? value === watch('password') || 'Les mots de passe ne correspondent pas' : true
                  })}
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                />
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

            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-primary-600 hover:text-primary-500"
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
            Transformez votre corps, atteignez vos objectifs ! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 