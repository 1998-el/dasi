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
  TrashIcon
} from '@heroicons/react/24/outline';
import { DeleteConfirmationModal, useDeleteConfirmation } from '../components/ui/DeleteConfirmationModal';

const studentsData = [
  { 
    id: '1', 
    name: 'Alice Johnson', 
    email: 'alice@email.com', 
    phone: '+33 6 12 34 56 78',
    address: '123 Rue de Paris, 75001 Paris',
    course: 'DÃ©veloppement Web',
    status: 'active',
    enrollmentDate: '2024-09-15',
    dateOfBirth: '2000-05-20',
    grade: 'Licence 2',
    avatar: 'AJ'
  },
  { id: '2', name: 'Bob Smith', email: 'bob@email.com', course: 'Data Science', status: 'active' },
  { id: '3', name: 'Carol White', email: 'carol@email.com', course: 'Design UI/UX', status: 'graduated' },
  { id: '4', name: 'David Brown', email: 'david@email.com', course: 'Marketing Digital', status: 'inactive' },
  { id: '5', name: 'Emma Wilson', email: 'emma@email.com', course: 'DÃ©veloppement Web', status: 'active' },
  { id: '6', name: 'Frank Miller', email: 'frank@email.com', course: 'Data Science', status: 'active' },
  { id: '7', name: 'Grace Lee', email: 'grace@email.com', course: 'Design UI/UX', status: 'active' },
  { id: '8', name: 'Henry Taylor', email: 'henry@email.com', course: 'Marketing Digital', status: 'graduated' },
  { id: '9', name: 'Isabel Garcia', email: 'isabel@email.com', course: 'DÃ©veloppement Web', status: 'active' },
  { id: '10', name: 'Jack Chen', email: 'jack@email.com', course: 'Data Science', status: 'inactive' },
  { id: '11', name: 'Karen Martinez', email: 'karen@email.com', course: 'Design UI/UX', status: 'active' },
  { id: '12', name: 'Leo Kim', email: 'leo@kim.com', course: 'Marketing Digital', status: 'active' },
];

const grades = [
  { course: 'HTML & CSS', grade: 18, maxGrade: 20, date: '2024-10-15' },
  { course: 'JavaScript', grade: 16, maxGrade: 20, date: '2024-11-01' },
  { course: 'React Basics', grade: 17, maxGrade: 20, date: '2024-11-20' },
  { course: 'Node.js', grade: 15, maxGrade: 20, date: '2024-12-10' },
  { course: 'TypeScript', grade: 19, maxGrade: 20, date: '2025-01-15' },
  { course: 'Database', grade: 14, maxGrade: 20, date: '2025-02-01' },
];

const attendance = [
  { month: 'Septembre', present: 20, absent: 2, late: 1 },
  { month: 'Octobre', present: 22, absent: 0, late: 0 },
  { month: 'Novembre', present: 18, absent: 3, late: 2 },
  { month: 'DÃ©cembre', present: 15, absent: 1, late: 0 },
];

export const StudentView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPerformance, setShowPerformance] = useState(false);
  const { isOpen, studentToDelete, showConfirmation, hideConfirmation } = useDeleteConfirmation();
  
  const student = studentsData.find(s => s.id === id);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Ã‰tudiant non trouvÃ©</p>
        <button 
          onClick={() => navigate('/students')}
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

  const averageGrade = grades.reduce((sum, g) => sum + g.grade, 0) / grades.length;
  const maxGrade = Math.max(...grades.map(g => g.grade));
  const minGrade = Math.min(...grades.map(g => g.grade));

  const handleDeleteClick = () => {
    showConfirmation(student.id, student.name);
  };

  const confirmDelete = () => {
    console.log('Deleting student:', studentToDelete?.id);
    hideConfirmation();
    navigate('/students');
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
        onClick={() => navigate('/students')}
        className="flex items-center gap-2 text-gray-500 hover:text-[#1067a8] transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Retour Ã  la liste
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-[#1067a8] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">{student.avatar || student.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
            <p className="text-gray-500">{student.course}</p>
            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border mt-2 ${getStatusBadge(student.status)}`}>
              {student.status === 'active' ? 'Actif' : student.status === 'graduated' ? 'DiplÃ´mÃ©' : 'Inactif'}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate(`/students/${id}/edit`)}
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
                  <p className="text-sm text-gray-700">{student.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1067a8]/5 rounded-lg flex items-center justify-center">
                  <PhoneIcon className="w-5 h-5 text-[#1067a8]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">TÃ©lÃ©phone</p>
                  <p className="text-sm text-gray-700">{(student as any).phone || 'Non renseignÃ©'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1067a8]/5 rounded-lg flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5 text-[#1067a8]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Adresse</p>
                  <p className="text-sm text-gray-700">{(student as any).address || 'Non renseignÃ©e'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1067a8]/5 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-[#1067a8]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date de naissance</p>
                  <p className="text-sm text-gray-700">{(student as any).dateOfBirth || 'Non renseignÃ©e'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <div className="space-y-3">
              {grades.map((grade, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookOpenIcon className="w-5 h-5 text-[#1067a8]" />
                    <span className="text-sm text-gray-700">{grade.course}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">{grade.date}</span>
                    <span className="text-sm font-semibold text-[#1067a8]">{grade.grade}/{grade.maxGrade}</span>
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
                    <p className="text-xs text-gray-400 mb-1">Moyenne gÃ©nÃ©rale</p>
                    <p className="text-2xl font-bold text-[#1067a8]">{averageGrade.toFixed(1)}/20</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Meilleure note</p>
                    <p className="text-2xl font-bold text-green-600">{maxGrade}/20</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">Note la plus basse</p>
                    <p className="text-2xl font-bold text-red-600">{minGrade}/20</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Ã‰volution des notes</p>
                  <div className="space-y-3">
                    {grades.map((grade, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{grade.course}</span>
                          <span className="font-medium text-[#1067a8]">{grade.grade}/20</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1067a8] rounded-full transition-all duration-500"
                            style={{ width: `${(grade.grade / grade.maxGrade) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">RÃ©partition des performances</p>
                  <div className="flex items-end gap-2 h-40">
                    {grades.map((grade, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-[#1067a8]/80 rounded-t transition-all duration-500"
                          style={{ height: `${(grade.grade / 20) * 100}%` }}
                        />
                        <span className="text-xs text-gray-400 mt-1 truncate w-full text-center">
                          {grade.course.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">PrÃ©sence</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {attendance.map((month, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-400 mb-2">{month.month}</p>
                  <p className="text-lg font-semibold text-[#1067a8]">{month.present}</p>
                  <p className="text-xs text-gray-400">prÃ©sences</p>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-red-500">{month.absent} absences</p>
                    <p className="text-xs text-yellow-500">{month.late} retards</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">DÃ©tails du cursus</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AcademicCapIcon className="w-5 h-5 text-[#1067a8]" />
                <div>
                  <p className="text-xs text-gray-400">Programme</p>
                  <p className="text-sm font-medium text-gray-700">{student.course}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AcademicCapIcon className="w-5 h-5 text-[#1067a8]" />
                <div>
                  <p className="text-xs text-gray-400">Niveau</p>
                  <p className="text-sm font-medium text-gray-700">{(student as any).grade || 'Non renseignÃ©'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-[#1067a8]" />
                <div>
                  <p className="text-xs text-gray-400">Date d'inscription</p>
                  <p className="text-sm font-medium text-gray-700">{(student as any).enrollmentDate || 'Non renseignÃ©e'}</p>
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
