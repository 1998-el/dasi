export interface JobOffer {
  id: number;
  title: string;
  department: string;
  location: string;
  type: 'CDI' | 'CDD' | 'Stage' | 'Alternance';
  experience: 'Débutant' | 'Junior' | 'Confirmé' | 'Senior';
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary: string;
  postedDate: string;
  deadline: string;
}

export const jobOffers: JobOffer[] = [
  {
    id: 1,
    title: 'Ingénieur Géomaticien',
    department: 'R&D',
    location: 'Yaoundé, Caméroun',
    type: 'CDI',
    experience: 'Confirmé',
    description: 'Recherche d\'un ingénieur géomaticien expérimenté pour rejoindre notre équipe de recherche et développement.',
    requirements: [
      'Master ou PhD en géomatique ou discipline related',
      '3+ ans d\'expérience en analyse de données spatiales',
      'Maîtrise des outils SIG (ArcGIS, QGIS)',
      'Connaissances en programmation (Python, R)',
      'Anglais professionnel'
    ],
    responsibilities: [
      'Collecte et analyse de données spatiales',
      'Développement de modèles et algorithmes',
      'Collaboration avec les équipes de développement',
      'Rédaction de rapports et publications',
      'Gestion de projets clients'
    ],
    salary: '400,000 - 600,000 FCFA / mois',
    postedDate: '15/02/2026',
    deadline: '15/03/2026'
  },
  {
    id: 2,
    title: 'Développeur Full Stack',
    department: 'Développement',
    location: 'Yaoundé, Caméroun',
    type: 'CDI',
    experience: 'Junior',
    description: 'Recherche d\'un développeur full stack pour participer au développement de nos solutions web et mobiles.',
    requirements: [
      'BAC+4 en informatique ou équivalent',
      '2+ ans d\'expérience en développement web',
      'Maîtrise de React.js et Node.js',
      'Connaissances en bases de données (PostgreSQL, MongoDB)',
      'Anglais professionnel'
    ],
    responsibilities: [
      'Développement d\'interfaces utilisateur',
      'Backend development et API REST',
      'Tests et optimisation des performances',
      'Maintenabilité des applications',
      'Collaboration avec les équipes de design'
    ],
    salary: '300,000 - 450,000 FCFA / mois',
    postedDate: '10/02/2026',
    deadline: '10/03/2026'
  },
  {
    id: 3,
    title: 'Stage - Data Analyst',
    department: 'Analyse',
    location: 'Yaoundé, Caméroun',
    type: 'Stage',
    experience: 'Débutant',
    description: 'Stage de 6 mois pour un étudiant en data science ou analyse de données.',
    requirements: [
      'Étudiant en Master 1 ou 2 en data science',
      'Connaissances des outils d\'analyse (Python, R)',
      'Bases de l\'analyse spatiale',
      'Anglais professionnel'
    ],
    responsibilities: [
      'Collecte et nettoyage de données',
      'Analyse descriptive et spatiales',
      'Visualisation de données',
      'Support aux équipes de projet',
      'Rédaction de rapports'
    ],
    salary: '40,000 - 60,000 FCFA / mois',
    postedDate: '05/02/2026',
    deadline: '05/03/2026'
  }
];
