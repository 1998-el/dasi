import React from 'react';
import { Navbar } from '../components/layout/Navbar';

export const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <div className="w-20 h-20 mx-auto bg-gray-200 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">Tarifs</h1>
            <p className="text-lg text-gray-600 mb-8">
              Nos tarifs sont en cours de finalisation. 
              Contactez-nous pour discuter de vos besoins spécifiques.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Consultation initiale</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">Gratuit</div>
                <p className="text-gray-600">Prise en compte de vos besoins</p>
              </div>
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Analyse de vos besoins</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Discussion des objectifs</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Estimation du projet</span>
                </li>
              </ul>
              <a 
                href="#contact" 
                className="w-full block py-3 px-6 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Demander une consultation
              </a>
            </div>

            <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Solutions personnalisées</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">Sur mesure</div>
                <p className="text-gray-600">Adaptées à vos besoins</p>
              </div>
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Solution tailor-made</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Support dédié</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Maintenance incluse</span>
                </li>
              </ul>
              <a 
                href="#contact" 
                className="w-full block py-3 px-6 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Discuter de votre projet
              </a>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-gray-500 mb-4">
              Vous avez un projet spécifique ?
            </p>
            <a href="#contact" className="inline-flex items-center space-x-2 text-gray-900 font-medium hover:text-gray-700 transition-colors">
              <span>Contactez-nous</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
