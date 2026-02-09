// import React, { useState } from 'react';
// import { jobOffers } from '../../data/jobs';
// import { JobOffer } from '../ui/JobOffer';
// import { Card } from '../ui/Card';
// import { Button } from '../ui/Button';
// import { ChevronRightIcon } from '@heroicons/react/24/outline';

// export const Careers: React.FC = () => {
//   const [filter, setFilter] = useState('all');
//   const [selectedJob, setSelectedJob] = useState<number | null>(null);

//   const filteredJobs = filter === 'all' 
//     ? jobOffers 
//     : jobOffers.filter(job => job.department === filter || job.type === filter || job.experience === filter);

//   const handleApply = (jobId: number) => {
//     setSelectedJob(jobId);
//     // In a real app, this would scroll to or open the application form
//     console.log('Applying for job:', jobId);
//   };

//   return (
//     <section id="careers" className="py-24 px-6 bg-gray-50">
//       <div className="max-w-7xl mx-auto">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//             Carrières chez DASI
//           </h2>
//           <p className="text-lg text-gray-600 max-w-3xl mx-auto">
//             Rejoignez une équipe dynamique d'experts passionnés par l'innovation et les données spatiales
//           </p>
//         </div>

//         {/* Filters */}
//         <div className="flex flex-wrap justify-center gap-3 mb-12">
//           {(['all', 'R&D', 'Développement', 'Analyse', 'CDI', 'CDD', 'Stage', 'Débutant', 'Junior', 'Confirmé', 'Senior'] as const).map((filterOption) => (
//             <button
//               key={filterOption}
//               onClick={() => setFilter(filterOption)}
//               className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
//                 filter === filterOption
//                   ? 'bg-[#1067a8] text-white'
//                   : 'bg-white text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               {filterOption === 'all' ? 'Toutes les offres' : filterOption}
//             </button>
//           ))}
//         </div>

//         {/* Job Offers */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {filteredJobs.map((job) => (
//             <JobOffer
//               key={job.id}
//               job={job}
//               onApply={handleApply}
//             />
//           ))}
//         </div>

//         {/* Empty State */}
//         {filteredJobs.length === 0 && (
//           <div className="text-center py-16">
//             <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
//               <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">
//               Aucune offre ne correspond à votre recherche
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Essayez de modifier vos filtres ou consultez notre page principale
//             </p>
//             <Button 
//               onClick={() => setFilter('all')}
//               variant="outline"
//               className="border-[#1067a8] text-[#1067a8] hover:bg-[#1067a8]/5"
//             >
//               Réinitialiser les filtres
//             </Button>
//           </div>
//         )}

//         {/* Culture Section */}
//         <div className="mt-24 bg-white rounded-3xl p-8 md:p-12 border border-gray-100">
//           <div className="grid md:grid-cols-2 gap-12 items-center">
//             <div>
//               <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
//                 Notre Culture d'Entreprise
//               </h3>
//               <div className="space-y-4 text-gray-600">
//                 <p>
//                   Chez DASI, nous valorisons l'innovation, la collaboration et le développement des talents.
//                   Nous offrons un environnement de travail stimulant où chaque membre de l'équipe a la possibilité de grandir.
//                 </p>
//                 <p>
//                   Nous croyons en l'importance de l'équilibre travail-vie personnelle et offrons des avantages compétitifs
//                   pour attirer et retenir les meilleurs professionnels.
//                 </p>
//               </div>
//               <div className="mt-8 space-y-3">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-[#1067a8]/10 rounded-lg flex items-center justify-center">
//                     <svg className="w-5 h-5 text-[#1067a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                     </svg>
//                   </div>
//                   <span className="text-gray-600">Développement continu</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-[#1067a8]/10 rounded-lg flex items-center justify-center">
//                     <svg className="w-5 h-5 text-[#1067a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                     </svg>
//                   </div>
//                   <span className="text-gray-600">Équilibre travail-vie</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-[#1067a8]/10 rounded-lg flex items-center justify-center">
//                     <svg className="w-5 h-5 text-[#1067a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                     </svg>
//                   </div>
//                   <span className="text-gray-600">Collaboration active</span>
//                 </div>
//               </div>
//             </div>
//             <div className="relative">
//               <div className="bg-gradient-to-br from-[#1067a8]/10 to-blue-100 rounded-2xl p-8">
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600">Equipe DASI</span>
//                     <span className="text-[#1067a8] font-medium">15+ membres</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600">Années d'expérience</span>
//                     <span className="text-[#1067a8] font-medium">5+ ans</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600">Projets réalisés</span>
//                     <span className="text-[#1067a8] font-medium">150+</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-600">Taux de satisfaction</span>
//                     <span className="text-[#1067a8] font-medium">96%</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };
