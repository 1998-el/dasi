import React, { useState, useEffect, useRef } from 'react';
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
  TrashIcon
} from '@heroicons/react/24/outline';

const studentsData = [
  { id: '1', name: 'Alice Johnson', email: 'alice@email.com', course: 'DÃ©veloppement Web', status: 'active' },
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
  { id: '12', name: 'Leo Kim', email: 'leo@email.com', course: 'Marketing Digital', status: 'active' },
];

interface ActionMenuProps {
  studentId: string;
  studentName: string;
  navigate: ReturnType<typeof useNavigate>;
  onDelete: (id: string, name: string) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ studentId, studentName, navigate, onDelete }) => {
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
      navigate(`/students/${studentId}`);
    } else if (action === 'edit') {
      navigate(`/students/${studentId}/edit`);
    } else if (action === 'delete') {
      onDelete(studentId, studentName);
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
        className={`absolute right-0 w-36 bg-white rounded-md shadow-md border border-gray-100 py-1 z-50 transition-all duration-200 ${
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

export const Students: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const { isOpen, studentToDelete, showConfirmation, hideConfirmation } = useDeleteConfirmation();

  const filteredStudents = studentsData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (searchTerm.trim()) {
      const firstMatch = filteredStudents[0];
      if (firstMatch) {
        setHighlightedId(firstMatch.id);
        
        setTimeout(() => {
          const row = document.getElementById(`student-row-${firstMatch.id}`);
          if (row && tableRef.current) {
            row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);

        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = setTimeout(() => {
          setHighlightedId(null);
        }, 3000);
      }
    } else {
      setHighlightedId(null);
    }
  }, [searchTerm, filteredStudents]);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-[#1067a8]/5 text-[#1067a8] border-[#1067a8]/10',
      graduated: 'bg-[#1067a8]/10 text-[#1067a8] border-[#1067a8]/20',
      inactive: 'bg-gray-100 text-gray-400 border-gray-200',
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const handleDeleteStudent = (id: string, name: string) => {
    showConfirmation(id, name);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      console.log('Deleting student:', studentToDelete.id);
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
          <h1 className="text-2xl font-semibold text-gray-900">Ã‰tudiants</h1>
          <p className="text-sm text-gray-400 mt-1">{studentsData.length} Ã©tudiants inscrits</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => navigate('/students/add')}
        >
          <PlusIcon className="w-4 h-4" />
          Ajouter un Ã©tudiant
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="relative w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un Ã©tudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
            />
          </div>
          <span className="text-sm text-gray-500">
            {filteredStudents.length} rÃ©sultat(s)
          </span>
        </div>

        <div ref={tableRef} className="overflow-y-auto max-h-[500px]">
          <table className="w-full">
            <thead className="bg-[#1067a8] sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Ã‰tudiant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Cours
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
              {filteredStudents.map((student) => (
                <tr 
                  key={student.id} 
                  id={`student-row-${student.id}`}
                  className={`transition-all duration-300 ${
                    highlightedId === student.id 
                      ? 'bg-[#1067a8]/5 shadow-sm scale-[1.01]' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                        highlightedId === student.id ? 'bg-[#1067a8]/10' : 'bg-[#1067a8]/5'
                      }`}>
                        <span className={`text-sm font-semibold ${
                          highlightedId === student.id ? 'text-[#1067a8]' : 'text-[#1067a8]'
                        }`}>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{student.course}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(student.status)}`}>
                      {student.status === 'active' ? 'Actif' : student.status === 'graduated' ? 'DiplÃ´mÃ©' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ActionMenu 
                      studentId={student.id} 
                      studentName={student.name}
                      navigate={navigate}
                      onDelete={handleDeleteStudent}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-500">
            Affichage de {filteredStudents.length} sur {studentsData.length} Ã©tudiants
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
