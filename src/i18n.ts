import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
// Assurez-vous que les chemins sont corrects par rapport à l'emplacement de i18n.ts
import translationFR from './pages/fr.json';
import translationEN from './pages/en.json';

const resources = {
  fr: {
    translation: translationFR, // 'translation' est le namespace par défaut
  },
  en: {
    translation: translationEN,
  },
};

i18n
  .use(initReactI18next) // Passe l'instance i18n à react-i18next
  .init({
    resources,
    lng: 'fr', // Langue par défaut
    fallbackLng: 'en', // Langue de secours si une traduction n'est pas trouvée
    interpolation: {
      escapeValue: false, // React protège déjà contre les attaques XSS
    },
    // debug: true, // Décommenter pour activer le mode debug d'i18next
  });

export default i18n;