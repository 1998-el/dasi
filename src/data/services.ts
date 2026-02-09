export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  details: string[];
  caseStudies: string[];
}

export const services: Service[] = [
  {
    id: 1,
    title: 'Collecte, traitement, analyse et valorisation des données',
    description: 'Solutions complètes pour la collecte, le traitement, l\'analyse et la valorisation des données',
    icon: 'database',
    details: [
      'Collecte de données spatiales de haute qualité',
      'Traitement et nettoyage des données',
      'Analyse approfondie et interprétation',
      'Valorisation des données pour la prise de décision'
    ],
    caseStudies: [
      'Étude de l\'occupation du sol pour un parc national',
      'Analyse de la qualité de l\'eau dans un bassin versant'
    ]
  },
  {
    id: 2,
    title: 'Formations, Ateliers & Séminaires',
    description: 'Formations et ateliers pour maîtriser les outils et techniques de data spatial',
    icon: 'graduation-cap',
    details: [
      'Formations sur les systèmes d\'information géographique',
      'Ateliers pratiques sur l\'analyse de données',
      'Séminaires sur les nouvelles technologies',
      'Formation continue et coaching'
    ],
    caseStudies: [
      'Formation GIS pour les agents de l\'environnement',
      'Atelier sur l\'utilisation des données satellitaires'
    ]
  },
  {
    id: 3,
    title: 'Conseil, audit & Suivi-Evaluation',
    description: 'Conseil technique et audit pour optimiser vos processus de gestion des données',
    icon: 'chart-area',
    details: [
      'Conseil technique et stratégique',
      'Audit de vos systèmes d\'information',
      'Suivi-évaluation des projets',
      'Optimisation des processus de collecte'
    ],
    caseStudies: [
      'Audit d\'un système d\'information géographique',
      'Suivi-évaluation d\'un projet de développement rural'
    ]
  },
  {
    id: 4,
    title: 'Appui aux initiatives agro-commerciales',
    description: 'Solutions adaptées aux besoins des initiatives agro-commerciales',
    icon: 'cogs',
    details: [
      'Analyse de la viabilité des exploitations agricoles',
      'Cartographie des zones de culture',
      'Optimisation des chaînes d\'approvisionnement',
      'Suivi de la production et des rendements'
    ],
    caseStudies: [
      'Appui à un projet de développement agricole',
      'Analyse de la chaîne d\'approvisionnement de produits agricoles'
    ]
  },
  {
    id: 5,
    title: 'Certification selon les normes en vigueur',
    description: 'Certification de vos données et processus selon les normes internationales',
    icon: 'graduation-cap',
    details: [
      'Certification ISO pour les systèmes de gestion',
      'Validation des données selon les standards',
      'Conformité aux réglementations en vigueur',
      'Amélioration continue des processus'
    ],
    caseStudies: [
      'Certification ISO pour un système de gestion de données',
      'Validation des données pour un projet international'
    ]
  }
];
