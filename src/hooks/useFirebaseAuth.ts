import { useState, useEffect } from 'react';
import { signInWithCustomToken, onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const useFirebaseAuth = () => {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const signInWithFirebase = async (customToken: string) => {
    try {
      await signInWithCustomToken(auth, customToken);
      console.log('✅ Connexion Firebase réussie via Custom Token');
    } catch (error) {
      console.error('❌ Erreur de connexion Firebase:', error);
      throw error;
    }
  };

  const signOutFromFirebase = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setIsFirebaseReady(false);
      console.log('👋 Déconnexion Firebase réussie');
    } catch (error) {
      console.error('❌ Erreur de déconnexion Firebase:', error);
    }
  };

  useEffect(() => {
    console.log('📡 [Firebase Auth] Initialisation du listener d\'état...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsFirebaseReady(!!user);
      if (user) {
        console.log('✅ [Firebase Auth] Utilisateur authentifié:', user.email || user.uid);
      } else {
        console.warn('⚠️ [Firebase Auth] Session Firebase inactive ou déconnectée');
      }
    });
    return () => unsubscribe();
  }, []);

  return {
    signInWithFirebase,
    signOutFromFirebase,
    firebaseUser,
    isFirebaseReady,
  };
};