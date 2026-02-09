import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const stats = [
  { 
    label: 'Total Ã‰tudiants', 
    value: '1,234', 
    change: '+12%',
    trend: 'up',
    icon: UserGroupIcon, 
  },
  { 
    label: 'Enseignants', 
    value: '56', 
    change: '+3%',
    trend: 'up',
    icon: AcademicCapIcon, 
  },
  { 
    label: 'Cours Actifs', 
    value: '89', 
    change: '-2%',
    trend: 'down',
    icon: BookOpenIcon, 
  },
  { 
    label: 'Taux de RÃ©ussite', 
    value: '94%', 
    change: '+5%',
    trend: 'up',
    icon: ChartBarIcon, 
  },
];

const notifications = [
  { type: 'student', title: 'Nouvel Ã©tudiant inscrit', name: 'Alice Johnson', time: 'il y a 5 min' },
  { type: 'course', title: 'Nouveau cours ajoutÃ©', name: 'Machine Learning AvancÃ©', time: 'il y a 15 min' },
  { type: 'student', title: 'Paiement reÃ§u', name: 'Bob Smith', time: 'il y a 30 min' },
  { type: 'teacher', title: 'Nouvel enseignant', name: 'Marie Dupont', time: 'il y a 1 heure' },
  { type: 'course', title: 'Cours complÃ©tÃ©', name: 'Design UI/UX', time: 'il y a 2 heures' },
];

export const Dashboard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#1067a8] -mx-8 -mt-8 px-8 py-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse delay-700" />
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-white/70 mt-1">Bienvenue sur EduFlow Pro</p>
        </div>

        <div className="relative h-12 mt-4 overflow-hidden rounded-lg bg-[#1067a8]/20 backdrop-blur-sm">
          <div className="absolute inset-0 flex items-center">
            {notifications.map((notification, index) => {
              
              return (
                <div
                  key={index}
                  className={`absolute inset-0 flex items-center px-4 transition-transform duration-700 ease-in-out`}
                  style={{
                    transform: `translateY(${(index - currentIndex) * 100}%)`,
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <span className="text-sm text-white/80">
                      <span className="font-medium text-white">{notification.title}</span>
                      {' - '}
                      {notification.name}
                    </span>
                    <span className="ml-auto text-xs text-white/50">{notification.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {notifications.map((_, index) => (
              <div
                key={index}
                className={`w-1 h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white w-2' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          
          return (
            <Card 
              key={stat.label} 
              className="p-5 bg-[#1067a8]/5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-[#1067a8]/10">
                  <Icon className="w-5 h-5 text-[#1067a8]" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-[#1067a8]' : 'text-gray-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900">ActivitÃ© RÃ©cente</h2>
            <button className="text-xs text-gray-400 hover:text-[#1067a8] transition-colors">Voir tout</button>
          </div>
          <div className="space-y-3">
            {[
              { id: '1', name: 'Alice Johnson', action: 'Nouvelle inscription', time: 'Il y a 5 min' },
              { id: '2', name: 'Bob Smith', action: 'Paiement effectuÃ©', time: 'Il y a 15 min' },
              { id: '3', name: 'Carol White', action: 'Cours complÃ©tÃ©', time: 'Il y a 1 heure' },
              { id: '4', name: 'David Brown', action: 'Nouveau message', time: 'Il y a 2 heures' },
            ].map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-[#1067a8]/5 cursor-pointer transition-all duration-200"
              >
                <div className="w-10 h-10 bg-[#1067a8]/10 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-sm font-semibold text-[#1067a8]">
                    {item.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.action}</p>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900">Cours Populaires</h2>
            <button className="text-xs text-gray-400 hover:text-[#1067a8] transition-colors">Voir tout</button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'DÃ©veloppement Web', progress: 85, students: 234 },
              { name: 'Data Science', progress: 72, students: 189 },
              { name: 'Design UI/UX', progress: 68, students: 156 },
              { name: 'Marketing Digital', progress: 54, students: 123 },
            ].map((course) => (
              <div key={course.name} className="py-2 px-2 rounded-lg hover:bg-[#1067a8]/5 cursor-pointer transition-all duration-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-900">{course.name}</span>
                  <span className="text-xs text-gray-400">{course.students} Ã©tudiants</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1067a8] rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
