import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { DeleteConfirmationModal, useDeleteConfirmation } from '../components/ui/DeleteConfirmationModal';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const coursesData = [
  { id: '1', name: 'DÃ©veloppement Web', code: 'DEV101', duration: '12 semaines', students: 234, status: 'active' },
  { id: '2', name: 'Data Science', code: 'DS201', duration: '16 semaines', students: 189, status: 'active' },
  { id: '3', name: 'Design UI/UX', code: 'UX301', duration: '8 semaines', students: 156, status: 'active' },
  { id: '4', name: 'Marketing Digital', code: 'MK401', duration: '10 semaines', students: 123, status: 'active' },
  { id: '5', name: 'Machine Learning', code: 'ML501', duration: '20 semaines', students: 98, status: 'inactive' },
  { id: '6', name: 'CybersÃ©curitÃ©', code: 'CS601', duration: '14 semaines', students: 67, status: 'active' },
  { id: '7', name: 'Cloud Computing', code: 'CC701', duration: '10 semaines', students: 45, status: 'active' },
  { id: '8', name: 'DevOps', code: 'DO801', duration: '12 semaines', students: 34, status: 'inactive' },
];

interface ActionMenuProps {
  courseId: string;
  courseName: string;
  navigate: ReturnType<typeof useNavigate>;
  onDelete: (id: string, name: string) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ courseId, courseName, navigate, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      setPosition(spaceBelow < 150 ? 'top' : 'bottom');
    }
    setIsOpen(!isOpen);
  };

  const handleAction = (action: string) => {
    if (action === 'view') {
      navigate(`/courses/${courseId}`);
    } else if (action === 'edit') {
      navigate(`/courses/${courseId}/edit`);
    } else if (action === 'delete') {
      onDelete(courseId, courseName);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`p-1.5 rounded-lg transition-all duration-200 ${
          isOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
        }`}
      >
        <EllipsisVerticalIcon className="w-4 h-4 text-gray-400" />
      </button>

      <div
        className={`absolute right-0 w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 transition-all duration-200 ${
          position === 'top' 
            ? `bottom-full mb-2 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`
            : `top-full mt-2 origin-top-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`
        }`}
      >
        <button
          onClick={() => handleAction('view')}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#1067a8]/5 hover:text-[#1067a8] transition-colors"
        >
          <EyeIcon className="w-4 h-4" />
          Voir
        </button>
        <button
          onClick={() => handleAction('edit')}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#1067a8]/5 hover:text-[#1067a8] transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
          Modifier
        </button>
        <button
          onClick={() => handleAction('delete')}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          Supprimer
        </button>
      </div>
    </div>
  );
};

export const Courses: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);
  const { isOpen, studentToDelete, showConfirmation, hideConfirmation } = useDeleteConfirmation();

  const filteredCourses = coursesData.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-[#1067a8]/5 text-[#1067a8] border-[#1067a8]/10',
      inactive: 'bg-gray-100 text-gray-400 border-gray-200',
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const handleDeleteCourse = (id: string, name: string) => {
    showConfirmation(id, name);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      console.log('Deleting course:', studentToDelete.id);
    }
    hideConfirmation();
  };

  return (
    <div className="space-y-6">
      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmDelete}
        studentName={studentToDelete?.name || ''}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Cours</h1>
          <p className="text-sm text-gray-400 mt-1">{coursesData.length} cours disponibles</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => navigate('/courses/add')}
        >
          <PlusIcon className="w-4 h-4" />
          Ajouter un cours
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="relative w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
            />
          </div>
          <span className="text-sm text-gray-500">
            {filteredCourses.length} rÃ©sultat(s)
          </span>
        </div>

        <div ref={tableRef} className="overflow-y-auto max-h-[500px]">
          <table className="w-full">
            <thead className="bg-[#1067a8] sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Cours
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  DurÃ©e
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Ã‰tudiants
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCourses.map((course) => (
                <tr 
                  key={course.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{course.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 font-mono">{course.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4 text-[#1067a8]" />
                      {course.duration}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <UserGroupIcon className="w-4 h-4 text-[#1067a8]" />
                      {course.students}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(course.status)}`}>
                      {course.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ActionMenu 
                      courseId={course.id}
                      courseName={course.name}
                      navigate={navigate}
                      onDelete={handleDeleteCourse}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-500">
            Affichage de {filteredCourses.length} sur {coursesData.length} cours
          </p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50" disabled>
              <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
