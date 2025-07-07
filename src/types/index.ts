// Types pour les utilisateurs et rôles
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'coach';
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student extends User {
  role: 'student';
  coachId: string;
  personalInfo: PersonalInfo;
  currentProgram?: string;
  programs: string[];
}

export interface Coach extends User {
  role: 'coach';
  students: string[];
  programs: string[];
}

// Informations personnelles
export interface PersonalInfo {
  age: number;
  height: number; // en cm
  initialWeight: number; // en kg
  targetWeight: number; // en kg
  phone?: string;
  address?: string;
  medicalNotes?: string;
}

// Types pour la nutrition
export interface NutritionEntry {
  id: string;
  userId: string;
  date: Date;
  meals: {
    petitDejeuner: {
      proteines: number;
      lipides: number;
      glucides: number;
      description?: string;
    };
    dejeuner: {
      legumes: number;
      proteines: number;
      glucides: number;
      description?: string;
    };
    collation: {
      description?: string;
      calories?: number;
    };
    diner: {
      salade: boolean;
      aubergine: boolean;
      saumon: boolean;
      skyr: boolean;
      banane: boolean;
      description?: string;
    };
  };
  water: number; // en litres
  alcohol: {
    quantity: number;
    type: string;
    calories: number;
  };
  coachComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour l'activité physique
export interface ExerciseEntry {
  id: string;
  userId: string;
  date: Date;
  type: 'sport' | 'etirements' | 'pyramid';
  duration?: number; // en minutes
  intensity?: 'low' | 'medium' | 'high';
  exercises: Exercise[];
  steps?: number;
  coachComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
} 