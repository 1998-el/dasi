import React, { useRef } from 'react';
import { Navbar } from '../layout/Navbar';
import { Hero } from '../sections/Hero';
import { Services } from '../sections/Services';
import { ContactForm } from '../sections/ContactForm';

export const Home: React.FC = () => {
  const isVisible = true; // Always visible by default
  const homeRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={homeRef} className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Statistics Section - Optimisé pour mobile */}
      <section className="py-12 md:py-24 px-4 sm:px-6 bg-orange-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: 'clock', number: '5+', text: 'Ans d\'expérience' },
              { icon: 'users', number: '150+', text: 'Projets réalisés' },
              { icon: 'documents', number: '85+', text: 'Clients satisfaits' },
              { icon: 'check', number: '96%', text: 'Taux de satisfaction' }
            ].map((stat, index) => (
              <div 
                key={index} 
                className={`text-center transition-all duration-700 ease-out transform ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 p-2 sm:p-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500">
                    {stat.icon === 'clock' && (
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {stat.icon === 'users' && (
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    {stat.icon === 'documents' && (
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {stat.icon === 'check' && (
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-50 mb-1 sm:mb-2">{stat.number}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-100 px-1">{stat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <Services />

      {/* Why Choose DASI Section */}
      <section className="py-12 md:py-24 px-4 sm:px-6" style={{ backgroundColor: 'var(--color-primary-blue)' }}>
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8 md:mb-16 transition-all duration-700 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`} style={{ transitionDelay: '300ms' }}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 px-4">
              Pourquoi choisir DASI ?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-3xl mx-auto px-4">
              Une expertise unique en intelligence spatiale et en valorisation des données
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: 'arrow-up', title: 'Expertise Technique', description: 'Notre équipe dispose d\'une expertise approfondie en collecte, analyse et valorisation des données spatiales.' },
              { icon: 'heart', title: 'Qualité Premium', description: 'Nous nous engageons à fournir des données de qualité exceptionnelle, rigoureusement vérifiées et conformes aux normes.' },
              { icon: 'users', title: 'Client Centric', description: 'Nous plaçons les besoins de nos clients au cœur de nos solutions, offrant un accompagnement personnalisé.' }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl md:rounded-lg p-6 md:p-8 border border-white/20 shadow-lg transition-all duration-700 ease-out transform ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center mb-4 md:mb-6" style={{ backgroundColor: 'var(--color-primary-blue)' }}>
                  <div className="w-6 h-6 md:w-8 md:h-8 text-white">
                    {item.icon === 'arrow-up' && (
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {item.icon === 'heart' && (
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                    {item.icon === 'users' && (
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">{item.title}</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactForm />

      {/* Footer - Optimisé pour mobile */}
      <footer className="bg-gray-900 text-white py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Data Spatial Intelligence</h3>
              <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6 leading-relaxed">
                Solutions innovantes en collecte, traitement, analyse et valorisation des données spatiales
              </p>
              <div className="flex gap-3 md:gap-4">
                {[
                  { 
                    href: "https://linkedin.com", 
                    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  },
                  { 
                    href: "https://wa.me/message/4T5DCUOVJLPXJ1",
                    icon: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"
                  },
                  { 
                    href: "#",
                    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  }
                ].map((social, idx) => (
                  <a 
                    key={idx}
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors duration-300"
                    aria-label="Réseaux sociaux"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: "Services",
                items: ["Collecte de données", "Analyse spatiale", "Solutions sur mesure", "Formations"]
              },
              {
                title: "Entreprise",
                items: ["À propos", "Blog", "Contact", "Carrières"]
              },
              {
                title: "Contact",
                items: [
                  "dataspatialintelligence@gmail.com",
                  "+237 682 877 106 / +237 675 345 158 / +237 658 184 703",
                  "Yaoundé, Damas",
                  "Cameroun"
                ]
              }
            ].map((column, idx) => (
              <div key={idx}>
                <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{column.title}</h4>
                <ul className="space-y-2 md:space-y-2">
                  {column.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      {idx < 2 ? (
                        <a 
                          href="#" 
                          className="text-sm md:text-base text-gray-400 hover:text-orange-500 transition-colors duration-300 block py-1"
                        >
                          {item}
                        </a>
                      ) : (
                        <span className="text-xs sm:text-sm md:text-base text-gray-400 block py-1 leading-relaxed">
                          {item}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-6 md:pt-8 text-center">
            <p className="text-xs sm:text-sm md:text-base text-gray-400">
              © 2026 Data Spatial Intelligence. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
