# 🥗 NutriTrack - Guide d'Installation Complet

Suivez ce guide étape par étape pour configurer, installer et lancer l'application sur votre environnement local.

---

## 🛠️ Étape 1 : Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :

1.  **Node.js (Version LTS)** : [Télécharger ici](https://nodejs.org/)
2.  **Git** : Pour cloner le projet sur votre machine.
3.  **Expo Go** : Téléchargez l'application sur votre smartphone ([App Store](https://apps.apple.com/app/expo-go/id982107779) ou [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)).

---
## 📱 Étape 2 : Connecter votre téléphone

Une fois que la commande `npx expo start` est lancée, un **QR Code** géant va apparaître dans votre terminal.

* **Réseau** : Connectez votre téléphone sur le **même réseau Wi-Fi** que votre ordinateur.
* **Application** : Ouvrez l'application **Expo Go** sur votre téléphone.
* **Scan** : Appuyez sur **"Scan QR Code"** (Android) ou utilisez l'appareil photo (iOS).
* **Action** : Scannez le code qui s'affiche sur votre écran d'ordinateur.
* **Chargement** : Attendez que le chargement (le "Build") atteigne 100% sur votre téléphone.
 ---
 ## 🔑 Étape 3 : Configuration des clés de sécurité

Pour que l'authentification et l'IA fonctionnent, vous devez configurer vos propres clés dans les fichiers suivants :

### 1. APIs
Ouvrez les fichiers suivants et remplacez `GROQ_API_KEY` par votre clé API Groq :
* `src/api/geminiAI.ts`
* `src/api/mealPlannerAI.ts`

typescript
const GROQ_API_KEY = "VOTRE_CLE_GROQ_ICI";
### 2. Base de données Firebase
Ouvrez le fichier `src/config/firebase.ts` et remplacez les informations de l'objet `firebaseConfig` par les identifiants de votre propre projet Firebase (disponibles dans les paramètres de votre projet sur la Console Firebase) :

typescript
`// Dans src/config/firebase.ts
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJET.firebaseapp.com",
  projectId: "VOTRE_PROJET_ID",
  storageBucket: "VOTRE_PROJET.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
}; `


 ---
## 💻 Étape 4 : Installation et Lancement

Ouvrez votre terminal (ou invite de commande CMD) et exécutez les commandes suivantes dans l'ordre :

### 1. Cloner et installer le projet
Copiez et collez ces commandes :

```bash
# Cloner le dépôt
git clone [https://github.com/VOTRE_NOM_UTILISATEUR/NutriTrack.git](https://github.com/VOTRE_NOM_UTILISATEUR/NutriTrack.git)

# Entrer dans le dossier
cd NutriTrack

# Installer les dépendances
npm install

# Lancer l'application
npx expo start
or
npx expo start -c

---


