import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
}

const navItems = [
  { path: '/', icon: HomeIcon, label: 'Dashboard' },
  { path: '/students', icon: UserGroupIcon, label: 'Ã‰tudiants' },
  { path: '/teachers', icon: AcademicCapIcon, label: 'Enseignants' },
  { path: '/courses', icon: BookOpenIcon, label: 'Cours' },
  { path: '/timetable', icon: CalendarIcon, label: 'Emplois du temps' },
  { path: '/tuition', icon: CurrencyDollarIcon, label: 'ScolaritÃ©' },
  { path: '/attendance', icon: ClipboardDocumentListIcon, label: 'PrÃ©sence' },
  // { path: '/attendance/add', icon: PlusIcon, label: 'Ajouter prÃ©sence' },
  { path: '/settings', icon: Cog6ToothIcon, label: 'ParamÃ¨tres' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-50 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className={`flex items-center gap-3 px-6 h-16 border-b border-gray-200 ${!isOpen && 'justify-center'}`}>
        <div className="w-8 h-8 bg-[#1067a8] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        {isOpen && (
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">EduFlow Pro</h1>
            <p className="text-xs text-gray-500">Gestion scolaire</p>
          </div>
        )}
      </div>

      <nav className="px-3 py-6 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[#1067a8] text-white'
                  : 'text-gray-600 hover:bg-[#1067a8]/10 hover:text-[#1067a8]'
              } ${!isOpen && 'justify-center'}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
