import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from './config/firebase';
import { useAuthStore } from './store/useAuthStore';
import { User } from './types';

// Import immédiat seulement pour Login (nécessaire au démarrage)
import Login from './pages/Login';

// Import des composants
import Layout from './components/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import PageLoader from './components/ui/PageLoader';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy imports pour optimiser les performances
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Nutrition = React.lazy(() => import('./pages/Nutrition'));
const Exercise = React.lazy(() => import('./pages/Exercise'));
const Measurements = React.lazy(() => import('./pages/Measurements'));
const Habits = React.lazy(() => import('./pages/Habits'));
const Profile = React.lazy(() => import('./pages/Profile'));
const CoachDashboard = React.lazy(() => import('./pages/coach/CoachDashboard'));
const StudentManagement = React.lazy(() => import('./pages/coach/StudentManagement'));

function App() {
  const { setUser, setLoading, isLoading, isAuthenticated, isCoach } = useAuthStore();

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Récupérer les données utilisateur depuis Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, 'id'>;
            const user: User = {
              id: firebaseUser.uid,
              ...userData,
            };
            setUser(user);
          } else {
            // Si l'utilisateur n'existe pas dans Firestore, le déconnecter
            await auth.signOut();
            setUser(null);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Route publique - Login */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login />
              )
            }
          />

          {/* Routes protégées */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>

              {/* Routes pour les élèves avec Suspense */}
              <Route path="/" element={
                <Suspense fallback={<PageLoader size="large" message="Chargement du dashboard..." />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="/nutrition" element={
                <Suspense fallback={<PageLoader message="Chargement de la nutrition..." />}>
                  <Nutrition />
                </Suspense>
              } />
              <Route path="/exercise" element={
                <Suspense fallback={<PageLoader message="Chargement des exercices..." />}>
                  <Exercise />
                </Suspense>
              } />
              <Route path="/measurements" element={
                <Suspense fallback={<PageLoader message="Chargement des mesures..." />}>
                  <Measurements />
                </Suspense>
              } />
              <Route path="/habits" element={
                <Suspense fallback={<PageLoader message="Chargement des habitudes..." />}>
                  <Habits />
                </Suspense>
              } />

              <Route path="/profile" element={
                <Suspense fallback={<PageLoader message="Chargement du profil..." />}>
                  <Profile />
                </Suspense>
              } />

              {/* Routes spécifiques aux coachs */}
              {isCoach() && (
                <>
                  <Route path="/coach" element={
                    <Suspense fallback={<PageLoader message="Chargement du dashboard coach..." />}>
                      <CoachDashboard />
                    </Suspense>
                  } />
                  <Route path="/coach/students" element={
                    <Suspense fallback={<PageLoader message="Chargement de la gestion des élèves..." />}>
                      <StudentManagement />
                    </Suspense>
                  } />
                </>
              )}

            </Route>
          </Route>

          {/* Redirection par défaut vers login si non connecté */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
