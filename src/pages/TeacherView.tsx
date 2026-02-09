import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { DeleteConfirmationModal, useDeleteConfirmation } from '../components/ui/DeleteConfirmationModal';

const teachersData = [
  { 
    id: '1', 
    name: 'Jean Dupont', 
    email: 'jean@maat.com', 
    phone: '+33 6 12 34 56 78',
    address: '123 Rue de Paris, 75001 Paris',
    subject: 'MathÃ©matiques',
    status: 'active',
    hireDate: '2020-09-01',
    dateOfBirth: '1975-03-15',
    avatar: 'JD',
    education: 'Doctorat en MathÃ©matiques',
    experience: '15 ans'
  },
  { id: '2', name: 'Marie Martin', email: 'marie@maat.com', phone: '+33 6 23 45 67 89', subject: 'Physique', status: 'active', avatar: 'MM' },
  { id: '3', name: 'Pierre Bernard', email: 'pierre@maat.com', subject: 'Informatique', status: 'active', avatar: 'PB' },
  { id: '4', name: 'Sophie Petit', email: 'sophie@maat.com', subject: 'FranÃ§ais', status: 'inactive', avatar: 'SP' },
  { id: '5', name: 'Lucas Robert', email: 'lucas@maat.com', subject: 'Anglais', status: 'active', avatar: 'LR' },
  { id: '6', name: 'Emma Moreau', email: 'emma@maat.com', subject: 'Histoire', status: 'active', avatar: 'EM' },
  { id: '7', name: 'Thomas Laurent', email: 'thomas@maat.com', subject: 'Chimie', status: 'active', avatar: 'TL' },
  { id: '8', name: 'Julie Simon', email: 'julie@maat.com', subject: 'Biologie', status: 'graduated', avatar: 'JS' },
];

const courses = [
  { name: 'AlgÃ¨bre LinÃ©aire', students: 25, schedule: 'Lun 9h-11h' },
  { name: 'Analyse MathÃ©matique', students: 30, schedule: 'Mar 14h-16h' },
  { name: 'Statistiques', students: 22, schedule: 'Jeu 10h-12h' },
];

const performance = [
  { month: 'Septembre', rating: 4.5, feedback: 12 },
  { month: 'Octobre', rating: 4.7, feedback: 15 },
  { month: 'Novembre', rating: 4.3, feedback: 10 },
  { month: 'DÃ©cembre', rating: 4.8, feedback: 18 },
];

export const TeacherView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPerformance, setShowPerformance] = useState(false);
  const { isOpen, studentToDelete, showConfirmation, hideConfirmation } = useDeleteConfirmation();
  
  const teacher = teachersData.find(t => t.id === id);

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Enseignant non trouvÃ©</p>
        <button 
          onClick={() => navigate('/teachers')}
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
      graduated: 'bg-[#1067a8]/10 text-[#1067a8] border-[#1067a8]/20',
      inactive: 'bg-gray-100 text-gray-400 border-gray-200',
    };
    return styles[status] || styles.active;
  };

  const averageRating = performance.reduce((sum, p) => sum + p.rating, 0) / performance.length;

  const handleDeleteClick = () => {
    showConfirmation(teacher.id, teacher.name);
  };

  const confirmDelete = () => {
    console.log('Deleting teacher:', studentToDelete?.id);
    hideConfirmation();
    navigate('/teachers');
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
        onClick={() => navigate('/teachers')}
        className="flex items-center gap-2 text-gray-500 hover:text-[#1067a8] transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Retour Ã  la liste
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-[#1067a8] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">{teacher.avatar || teacher.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{teacher.name}</h1>
            <p className="text-gray-500">{teacher.subject}</p>
            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border mt-2 ${getStatusBadge(teacher.status)}`}>
              {teacher.status === 'active' ? 'Actif' : teacher.status === 'graduated' ? 'DiplÃ´mÃ©' : 'Inactif'}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate(`/teachers/${id}/edit`)}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1067a8]/5 rounded-lg flex items-center justify-center">
                  <EnvelopeIcon className="w-5 h-5 text-[#1067a8]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-gray-700">{teacher.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1067a8]/5 rounded-lg flex items-center justify-center">
                  <PhoneIcon className="w-5 h-5 text-[#1067a8]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">TÃ©lÃ©phone</p>
                  <p className="text-sm text-gray-700">{(teacher as any).phone || 'Non renseignÃ©'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1067a8]/5 rounded-lg flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5 text-[#1067a8]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Adresse</p>
                  <p className="text-sm text-gray-700">{(teacher as any).address || 'Non renseignÃ©e'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1067a8]/5 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-[#1067a8]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date de naissance</p>
                  <p className="text-sm text-gray-700">{(teacher as any).dateOfBirth || 'Non renseignÃ©e'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-[#1067a8]" />
              Cours enseignÃ©s
            </h2>
            <div className="space-y-3">
              {courses.map((course, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1067a8]/10 rounded-lg flex items-center justify-center">
                      <BookOpenIcon className="w-5 h-5 text-[#1067a8]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.name}</p>
                      <p className="text-xs text-gray-400">{course.schedule}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <UserGroupIcon className="w-4 h-4" />
                    {course.students} Ã©tudiants
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <button 
              onClick={() => setShowPerformance(!showPerformance)}
              className="w-full flex items-center justify-between mb-4"
            >
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-[#1067a8]" />
                Performance
              </h2>
              {showPerformance ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showPerformance && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-[#1067a8]/5 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Note moyenne</p>
                    <p className="text-2xl font-bold text-[#1067a8]">{averageRating.toFixed(1)}/5</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Meilleure note</p>
                    <p className="text-2xl font-bold text-green-600">5.0/5</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Total retours</p>
                    <p className="text-2xl font-bold text-blue-600">55</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Ã‰volution des Ã©valuations</p>
                  <div className="space-y-3">
                    {performance.map((month, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{month.month}</span>
                          <span className="font-medium text-[#1067a8]">{month.rating}/5 ({month.feedback} retours)</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1067a8] rounded-full transition-all duration-500"
                            style={{ width: `${(month.rating / 5) * 100}%` }}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">DÃ©tails professionnels</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AcademicCapIcon className="w-5 h-5 text-[#1067a8]" />
                <div>
                  <p className="text-xs text-gray-400">MatiÃ¨re</p>
                  <p className="text-sm font-medium text-gray-700">{teacher.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AcademicCapIcon className="w-5 h-5 text-[#1067a8]" />
                <div>
                  <p className="text-xs text-gray-400">Formation</p>
                  <p className="text-sm font-medium text-gray-700">{(teacher as any).education || 'Non renseignÃ©e'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-[#1067a8]" />
                <div>
                  <p className="text-xs text-gray-400">Date d'embauche</p>
                  <p className="text-sm font-medium text-gray-700">{(teacher as any).hireDate || 'Non renseignÃ©e'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-[#1067a8]" />
                <div>
                  <p className="text-xs text-gray-400">ExpÃ©rience</p>
                  <p className="text-sm font-medium text-gray-700">{(teacher as any).experience || 'Non renseignÃ©e'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Envoyer un message
              </button>
              <button className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Voir le dossier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
