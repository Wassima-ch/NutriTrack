export interface UserProfile {
  uid: string;
  nom: string;
  prenom: string;
  email: string;
  age?: number;
  sexe?: 'Homme' | 'Femme';
  poids?: number;
  taille?: number;
  objectif?: string;
  preferences?: string[];
  bmr?: number;
  profileComplete: boolean;
  createdAt: string;
}