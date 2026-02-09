import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ClockIcon,
  UserGroupIcon,
  BookOpenIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { DeleteConfirmationModal, useDeleteConfirmation } from '../components/ui/DeleteConfirmationModal';

const coursesData = [
  { 
    id: '1', 
    name: 'DÃ©veloppement Web', 
    code: 'DEV101', 
    duration: '12 semaines',
    students: 234,
    status: 'active',
    description: 'Apprenez Ã  crÃ©er des sites web modernes et des applications web responsives avec HTML, CSS, JavaScript et les frameworks populaires.',
    startDate: '2024-09-01',
    endDate: '2024-11-30',
    price: 150000,
    teacher: 'Jean Dupont',
    level: 'DÃ©butant',
    modules: 8
  },
  { id: '2', name: 'Data Science', code: 'DS201', duration: '16 semaines', students: 189, status: 'active' },
  { id: '3', name: 'Design UI/UX', code: 'UX301', duration: '8 semaines', students: 156, status: 'active' },
  { id: '4', name: 'Marketing Digital', code: 'MK401', duration: '10 semaines', students: 123, status: 'active' },
  { id: '5', name: 'Machine Learning', code: 'ML501', duration: '20 semaines', students: 98, status: 'inactive' },
  { id: '6', name: 'CybersÃ©curitÃ©', code: 'CS601', duration: '14 semaines', students: 67, status: 'active' },
  { id: '7', name: 'Cloud Computing', code: 'CC701', duration: '10 semaines', students: 45, status: 'active' },
  { id: '8', name: 'DevOps', code: 'DO801', duration: '12 semaines', students: 34, status: 'inactive' },
];

const courseProgress = [
  { month: 'Septembre', students: 180, completion: 75 },
  { month: 'Octobre', students: 200, completion: 82 },
  { month: 'Novembre', students: 220, completion: 78 },
  { month: 'DÃ©cembre', students: 234, completion: 85 },
];

export const CourseView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);
  const { isOpen, studentToDelete, showConfirmation, hideConfirmation } = useDeleteConfirmation();
  
  const course = coursesData.find(c => c.id === id);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Cours non trouvÃ©</p>
        <button 
          onClick={() => navigate('/courses')}
          className="mt-4 text-[#1067a8] hover:underline"
        >
          Retour Ã  la liste
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-[#1067a8]/5 text-[#1067a8] border-[#1067a8]/10',
      inactive: 'bg-gray-100 text-gray-400 border-gray-200',
    };
    return styles[status] || styles.active;
  };

  const averageCompletion = courseProgress.reduce((sum, p) => sum + p.completion, 0) / courseProgress.length;

  const handleDeleteClick = () => {
    showConfirmation(course.id, course.name);
  };

  const confirmDelete = () => {
    console.log('Deleting course:', studentToDelete?.id);
    hideConfirmation();
    navigate('/courses');
  };

  return (
    <div className="space-y-6">
      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmDelete}
        studentName={studentToDelete?.name || ''}
      />

      <button 
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-gray-500 hover:text-[#1067a8] transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Retour Ã  la liste
      </button>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1067a8] rounded-xl flex items-center justify-center shadow-lg">
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{course.name}</h1>
              <p className="text-gray-500 font-mono">{course.code}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate(`/courses/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1067a8] text-white rounded-lg text-sm font-medium hover:bg-[#1067a8]/90 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Modifier
          </button>
          <button 
            onClick={handleDeleteClick}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description du cours</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {(course as any).description || 'Aucune description disponible pour ce cours.'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Modules du cours</h2>
            <div className="space-y-3">
              {Array.from({ length: (course as any).modules || 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#1067a8]/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#1067a8]">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Module {index + 1}</p>
                      <p className="text-xs text-gray-400">Introduction et concepts de base</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">2 semaines</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <button 
              onClick={() => setShowStats(!showStats)}
              className="w-full flex items-center justify-between mb-4"
            >
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-[#1067a8]" />
                Statistiques
              </h2>
              {showStats ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showStats && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-[#1067a8]/5 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Total Ã©tudiants</p>
                    <p className="text-2xl font-bold text-[#1067a8]">{course.students}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Taux de complÃ©tion</p>
                    <p className="text-2xl font-bold text-green-600">{averageCompletion.toFixed(0)}%</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Modules</p>
                    <p className="text-2xl font-bold text-blue-600">{(course as any).modules || 0}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Ã‰volution des inscriptions</p>
                  <div className="space-y-3">
                    {courseProgress.map((month, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{month.month}</span>
                          <span className="font-medium text-[#1067a8]">{month.students} Ã©tudiants ({month.completion}%)</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1067a8] rounded-full transition-all duration-500"
                            style={{ width: `${month.completion}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">DÃ©tails du cours</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-[#1067a8]" />
                <div>
                  <p className="text-xs text-gray-400">DurÃ©e</p>
                  <p className="text-sm font-medium text-gray-700">{course.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <UserGroupIcon className="w-5 h-5 text-[#1067a8]" />
                <div>
                  <p className="text-xs text-gray-400">Ã‰tudiants inscrits</p>
                  <p className="text-sm font-medium text-gray-700">{course.students}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AcademicCapIcon className="w-5 h-5 text-[#1067a8]" />
                <div>
                  <p className="text-xs text-gray-400">Enseignant</p>
                  <p className="text-sm font-medium text-gray-700">{(course as any).teacher || 'Non assignÃ©'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-[#1067a8]" />
                <div>
                  <p className="text-xs text-gray-400">Niveau</p>
                  <p className="text-sm font-medium text-gray-700">{(course as any).level || 'Tous niveaux'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-[#1067a8]" />
                <div>
                  <p className="text-xs text-gray-400">Prix</p>
                  <p className="text-sm font-medium text-gray-700">{(course as any).price?.toLocaleString() || 'N/A'} CFA</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(course.status)}`}>
                {course.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Voir la liste des Ã©tudiants
              </button>
              <button className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                GÃ©rer les modules
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
