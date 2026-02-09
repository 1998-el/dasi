import React from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Navbar } from '../components/layout/Navbar';
import {
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  StarIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: ChartBarIcon,
    title: 'Collecte, traitement, analyse et valorisation des données',
    description: 'Solutions complètes pour la gestion des données spatiales.',
  },
  {
    icon: AcademicCapIcon,
    title: 'Formations, ateliers et séminaires',
    description: 'Programmes de formation sur les techniques de gestion des données.',
  },
  {
    icon: UsersIcon,
    title: 'Conseil, audit et suivi-évaluation',
    description: 'Accompagnement dans la mise en œuvre de solutions data-driven.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Appui aux initiatives agro-commerciales',
    description: 'Solutions spécialisées pour le secteur agroalimentaire et commercial.',
  },
  {
    icon: StarIcon,
    title: 'Certification selon les normes en vigueur',
    description: 'Services de certification pour les professionnels.',
  },
];

const testimonials = [
  {
    name: 'Dr. Jean-Paul Mbah',
    role: 'Directeur, Institut de Recherche',
    text: 'Data Spatial Intelligence a transformé notre façon de collecter et d\'analyser les données spatiales. Leur expertise a permis d\'améliorer nos processus de 60%.',
    rating: 5,
  },
  {
    name: 'Marie Nguema',
    role: 'Cheffe de Projet, ONG',
    text: 'Les solutions de traitement des données proposées ont simplifié notre travail. Les rapports détaillés nous aident à prendre des décisions éclairées.',
    rating: 4,
  },
  {
    name: 'Patrick Tchouafé',
    role: 'Ingénieur Agronome',
    text: 'L\'accompagnement dans les initiatives agro-commerciales a été excellent. Nos performances ont augmenté de 45% grâce à leurs solutions.',
    rating: 5,
  },
];

const stats = [
  { number: '150+', label: 'Projets' },
  { number: '85+', label: 'Clients' },
  { number: '96%', label: 'Satisfaction' },
  { number: '5+', label: 'Ans d\'expertise' },
];

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1067a8] to-[#0A2463] text-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Data Spatial Intelligence
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Solutions innovantes en collecte, traitement, analyse et valorisation des données spatiales
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-[#fabb10] text-black hover:bg-[#fabb10]/90">
                  Nos Services
                  <ChevronRightIcon className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                  Contactez-nous
                </Button>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="relative z-10">
                <div className="bg-white rounded-2xl shadow-2xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#1067a8] rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Analyse de Données</h3>
                      <p className="text-sm text-gray-500">150+ Projets</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taux de satisfaction</span>
                      <span className="text-sm font-semibold text-[#1067a8]">96%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Clients satisfaits</span>
                      <span className="text-sm font-semibold text-[#1067a8]">85+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expertise</span>
                      <span className="text-sm font-semibold text-[#1067a8]">5+ ans</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-white/10 rounded-2xl -z-10 animate-float"></div>
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-white/10 rounded-2xl -z-10 animate-float delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <p className="text-3xl md:text-4xl font-bold text-[#1067a8] mb-2">{stat.number}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos Services
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Des solutions complètes pour la gestion et valorisation des données spatiales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 bg-[#1067a8]/10 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-[#1067a8]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce Que Disent Nos Utilisateurs
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Découvrez comment EduFlow Pro a transformé la gestion des établissements
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-[#fabb10]" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">{testimonial.text}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1067a8]/5 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-[#1067a8]">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-[#1067a8] to-[#0A2463]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à Transformer Vos Données en Valeur ?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez nos clients satisfaits et découvrez comment Data Spatial Intelligence peut améliorer vos processus de gestion des données
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#fabb10] text-black hover:bg-[#fabb10]/90">
              Découvrir nos services
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
              Demander un devis
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">Data Spatial Intelligence</h3>
              <p className="text-gray-400 mb-6">
                Solutions innovantes en collecte, traitement, analyse et valorisation des données spatiales
              </p>
              <div className="flex gap-4">
                <a href="https://www.linkedin.com/in/data-spacial-intelligence-a19a473ab?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" 
                   target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#1067a8] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://wa.me/message/4T5DCUOVJLPXJ1" 
                   target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#1067a8] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
                  </svg>
                </a>
                <a href="#" 
                   target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#1067a8] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#1067a8] transition-colors">Collecte de données</a></li>
                <li><a href="#" className="hover:text-[#1067a8] transition-colors">Traitement des données</a></li>
                <li><a href="#" className="hover:text-[#1067a8] transition-colors">Analyse et valorisation</a></li>
                <li><a href="#" className="hover:text-[#1067a8] transition-colors">Formations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#1067a8] transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-[#1067a8] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#1067a8] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[#1067a8] transition-colors">Carrières</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>dataspatialintelligence@gmail.com</li>
                <li>+237 682 877 106 / +237 675 345 158 / +237 658 184 703</li>
                <li>Yaoundé, Damas</li>
                <li>Cameroun</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 EduFlow Pro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
