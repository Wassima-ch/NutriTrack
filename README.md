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
## 💻 Étape 3 : Installation et Lancement

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
npx expo start  or npx expo start -c

---


