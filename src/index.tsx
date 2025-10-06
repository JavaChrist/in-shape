import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enregistrer le service worker pour PWA
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('✅ InShape PWA prête pour utilisation hors ligne');
  },
  onUpdate: (registration) => {
    console.log('🔄 Nouvelle version d\'InShape disponible');
    // Optionnel: afficher une notification de mise à jour
  }
});

// Mesure des performances web vitals
reportWebVitals();
