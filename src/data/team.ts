export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
  socialLinks: {
    linkedin?: string;
    email?: string;
  };
}

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Dr. Jean Paul Mbah',
    role: 'Directeur Général',
    bio: 'Ingénieur géomaticien avec plus de 10 ans d\'expérience dans l\'analyse de données spatiales et le développement de solutions innovantes.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    socialLinks: {
      linkedin: 'https://linkedin.com',
      email: 'jean.paul@dasi.com'
    }
  },
  {
    id: 2,
    name: 'Marie Nguema',
    role: 'Cheffe de Projet',
    bio: 'Expertise dans la gestion de projets complexes de collecte et d\'analyse de données géospatiales.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    socialLinks: {
      linkedin: 'https://linkedin.com',
      email: 'marie.nguema@dasi.com'
    }
  },
  {
    id: 3,
    name: 'Patrick Tchouafé',
    role: 'Ingénieur Data Scientist',
    bio: 'Spécialisé dans l\'analyse de données complexes et la modélisation spatiale.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    socialLinks: {
      linkedin: 'https://linkedin.com',
      email: 'patrick.tchouafe@dasi.com'
    }
  },
  {
    id: 4,
    name: 'Sophie Mboma',
    role: 'Développeuse Full Stack',
    bio: 'Développeuse web et mobile spécialisée dans les applications de gestion des données spatiales.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    socialLinks: {
      linkedin: 'https://linkedin.com',
      email: 'sophie.mboma@dasi.com'
    }
  }
];
