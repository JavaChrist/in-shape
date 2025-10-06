# 🏋️‍♂️ InShape

Application React complète de **suivi fitness et coaching personnalisé** remplaçant les tableaux Excel pour un suivi moderne et interactif.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)
![Firebase](https://img.shields.io/badge/Firebase-10.x-ffca28.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06b6d4.svg)

---

## 📋 Table des matières

- [🎯 Aperçu](#-aperçu)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🛠️ Technologies](#️-technologies)
- [🚀 Installation](#-installation)
- [📱 Pages de l'application](#-pages-de-lapplication)
- [🔬 Calculs scientifiques](#-calculs-scientifiques)
- [🎨 Design et UX](#-design-et-ux)
- [🔐 Sécurité](#-sécurité)
- [📈 Suivi et analytics](#-suivi-et-analytics)
- [🤝 Contribution](#-contribution)

---

## 🎯 Aperçu

**InShape** est une application web progressive (PWA) développée pour remplacer des tableaux Excel de suivi fitness par une interface moderne, intuitive et scientifiquement rigoureuse.

### 🎯 **Objectif principal**

Transformer le coaching fitness traditionnel en expérience numérique complète avec :

- **Suivi des mesures corporelles** avec calculs automatiques
- **Planning d'exercices** personnalisé selon vos tableaux
- **Tracking d'habitudes** hebdomadaire motivant
- **Profil personnalisé** avec mission transformation
- **Interface coach-élève** pour un suivi optimal

---

## ✨ Fonctionnalités

### 🏠 **Dashboard**

- **Vue d'ensemble** des progrès récents
- **Statistiques** en temps réel
- **Navigation rapide** vers toutes les sections
- **Widgets** informatifs et motivants

### 📏 **Mesures Corporelles**

- ✅ **Saisie des 4 plis cutanés** (biceps, triceps, sous-scapulaire, supra-iliaque)
- ✅ **Calcul automatique** du taux de masse grasse (formule Durnin & Womersley)
- ✅ **Coefficients scientifiques** par âge et genre
- ✅ **Graphique d'évolution** interactif
- ✅ **Historique complet** des mesures
- ✅ **Instructions visuelles** avec images
- ✅ **Tableau technique** des coefficients C et M

### 💪 **Exercices**

- ✅ **Templates d'exercices** basés sur vos programmes (Swings, Front Squats, etc.)
- ✅ **Suivi complet** : poids, répétitions, séries, sensation (1-10)
- ✅ **Commentaires** pour douleurs et observations
- ✅ **Calcul volume** automatique (poids × reps × séries)
- ✅ **Graphiques évolution** poids et volume d'entraînement
- ✅ **Section Pyramide** avec objectifs et difficulté
- ✅ **Historique séances** détaillé

### 📊 **Tracking Habitudes**

- ✅ **4 catégories** : Alimentation, Sommeil, Sports, Questions & Projection
- ✅ **22 objectifs** différents selon vos tableaux Excel
- ✅ **Suivi hebdomadaire** avec cases à cocher
- ✅ **Progression par catégorie** avec pourcentages
- ✅ **Navigation temporelle** par semaines
- ✅ **Messages motivants** selon performance
- ✅ **Résumé statistique** détaillé

### 👤 **Profil Personnel**

- ✅ **Informations personnelles** éditables (âge, genre, contacts)
- ✅ **Calcul IMC** automatique
- ✅ **Mission transformation** personnalisable en 4 thèmes :
  - 📋 Décris ton objectif
  - 💭 Pourquoi atteindre cet objectif
  - ✨ Avantages et bénéfices
  - 🔄 Changements d'habitudes
- ✅ **Bilan des échanges** avec le coach
- ✅ **Espace formation** avec liens vidéos

---

## 🛠️ Technologies

### **Frontend**

- **React 18** avec TypeScript pour la robustesse
- **TailwindCSS 3.4** pour le design moderne
- **Recharts** pour les graphiques interactifs
- **Heroicons** pour l'iconographie
- **React Router** pour la navigation
- **Zustand** pour la gestion d'état

### **Backend & Database**

- **Firebase Authentication** pour la sécurité
- **Firestore Database** pour les données temps réel
- **Firebase Hosting** pour le déploiement

### **Development Tools**

- **Vite/Create React App** pour le build
- **ESLint & Prettier** pour la qualité code
- **TypeScript** pour la sécurité des types

---

## 🚀 Installation

### **Prérequis**

- Node.js 16+
- npm ou yarn
- Compte Firebase

### **Étapes d'installation**

1. **Cloner le repository**

```bash
git clone https://github.com/votre-username/in-shape-app.git
cd in-shape-app
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration Firebase**

**⚠️ Important :** Sans configuration Firebase, l'authentification ne fonctionnera pas.

### Obtenir les clés Firebase :

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Allez dans **Paramètres du projet** > **Général**
4. Dans "Vos applications", cliquez sur l'icône web `</>`
5. Copiez les valeurs de configuration

### Créer le fichier de configuration :

```bash
# Créer le fichier .env
touch .env
```

Remplir le fichier `.env` avec vos vraies clés Firebase :

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=votre-projet-id
REACT_APP_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
```

### Configuration Firestore :

1. Dans Firebase Console, allez dans **Firestore Database**
2. Créez une base de données en mode **test** ou **production**
3. Configurez les règles de sécurité selon vos besoins

4. **Lancer l'application**

```bash
# Mode développement
npm start

# Build production
npm run build
```

---

## 📱 Pages de l'application

### 🏠 **Dashboard** (`/`)

**Vue d'ensemble** de tous vos progrès avec widgets informatifs et navigation rapide.

### 📏 **Mesures** (`/measurements`)

**Saisie et suivi** des mesures corporelles avec calculs automatiques du taux de masse grasse.

### 💪 **Exercices** (`/exercise`)

**Planning et suivi** des séances d'entraînement avec graphiques de progression.

### 📊 **Tracking** (`/nutrition`)

**Suivi hebdomadaire** des habitudes de vie selon 4 catégories principales.

### 👤 **Profil** (`/profile`)

**Gestion du profil** personnel et mission de transformation personnalisée.

---

## 🔬 Calculs scientifiques

### **Taux de masse grasse (Durnin & Womersley)**

**Formule utilisée :**

```
Densité corporelle = C - (M × log₁₀(somme des 4 plis))
% Masse grasse = ((4,95 / Densité) - 4,50) × 100
```

**Coefficients par âge et genre :**

| **Hommes** | 17-19 ans | 20-29 ans | 30-39 ans | 40-49 ans | >50 ans |
| ---------- | --------- | --------- | --------- | --------- | ------- |
| **C**      | 1,1620    | 1,1631    | 1,1422    | 1,1620    | 1,1715  |
| **M**      | 0,0678    | 0,0632    | 0,0544    | 0,0700    | 0,0779  |

| **Femmes** | 16-19 ans | 20-29 ans | 30-39 ans | 40-49 ans | >50 ans |
| ---------- | --------- | --------- | --------- | --------- | ------- |
| **C**      | 1,1549    | 1,1599    | 1,1423    | 1,1333    | 1,1339  |
| **M**      | 0,0678    | 0,0717    | 0,0632    | 0,0612    | 0,0645  |

### **Calcul IMC**

```
IMC = Poids (kg) / (Taille (m))²
```

### **Volume d'entraînement**

```
Volume = Poids × Répétitions × Séries
```

---

## 🎨 Design et UX

### **Palette de couleurs**

- **Primaire** : Bleu moderne (#3B82F6)
- **Succès** : Vert énergique (#10B981)
- **Attention** : Orange motivant (#F59E0B)
- **Danger** : Rouge d'alerte (#EF4444)

### **Principe de design**

- ✅ **Mobile-first** : Responsive sur tous appareils
- ✅ **Accessibilité** : Contrastes et navigation clavier
- ✅ **Performance** : Lazy loading et optimisations
- ✅ **Intuitivité** : Navigation claire et logique

### **Composants UI**

- **Cards** modulaires pour chaque section
- **Graphiques** interactifs et animés
- **Formulaires** avec validation temps réel
- **Feedback** visuel pour toutes les actions

---

## 🔐 Sécurité

### **Authentification**

- ✅ **Firebase Auth** avec email/password
- ✅ **Routes protégées** (PrivateRoute)
- ✅ **Gestion des sessions** automatique
- ✅ **Validation côté client** et serveur

### **Base de données**

- ✅ **Règles Firestore** strictes par utilisateur
- ✅ **Validation des données** en temps réel
- ✅ **Isolation des données** entre utilisateurs
- ✅ **Sauvegarde automatique** et persistance

---

## 📈 Suivi et analytics

### **Métriques de progression**

- **Mesures corporelles** : Évolution du taux de masse grasse
- **Performances exercices** : Progression des charges
- **Habitudes** : Pourcentages d'accomplissement hebdomadaire
- **Engagement** : Fréquence d'utilisation et assiduité

### **Graphiques disponibles**

- 📈 **Évolution masse grasse** (courbe temporelle)
- 💪 **Progression poids** par exercice
- 📊 **Volume d'entraînement** (barres)
- 🎯 **Tracking habitudes** (pourcentages)

---

## 🤝 Contribution

### **Structure du projet**

```
src/
├── components/          # Composants réutilisables
├── pages/              # Pages principales
├── store/              # Gestion d'état Zustand
├── utils/              # Fonctions utilitaires
├── types/              # Types TypeScript
└── styles/             # Styles TailwindCSS
```

### **Standards de code**

- ✅ **TypeScript strict** pour la sécurité
- ✅ **ESLint** pour la qualité
- ✅ **Prettier** pour la cohérence
- ✅ **Commits conventionnels** pour l'historique

---

## 📞 Support

Pour toute question ou suggestion concernant **InShape** :

- 📧 **Email** : support@inshape.com
- 🐛 **Issues** : [GitHub Issues](https://github.com/votre-repo/in-shape-app/issues)
- 📖 **Documentation** : [Wiki du projet](https://github.com/votre-repo/in-shape-app/wiki)

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🎉 Remerciements

Merci à tous ceux qui ont contribué à faire d'**InShape** une application complète et professionnelle :

- **Formules scientifiques** : Durnin & Womersley
- **Design inspiration** : Modern fitness apps
- **Technologies** : React, Firebase, TailwindCSS communities

---

<div align="center">

**InShape** - _Transformez votre coaching fitness_ 🚀

[⭐ Star ce repo](https://github.com/votre-repo/in-shape-app) • [🐛 Report Bug](https://github.com/votre-repo/in-shape-app/issues) • [✨ Request Feature](https://github.com/votre-repo/in-shape-app/issues)

</div>
