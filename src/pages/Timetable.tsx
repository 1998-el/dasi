import React, { useState } from 'react';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const timeSlots = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
];

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const courses = [
  { id: '1', name: 'DÃ©veloppement Web', color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-50' },
  { id: '2', name: 'Data Science', color: 'bg-green-500', textColor: 'text-green-600', bgLight: 'bg-green-50' },
  { id: '3', name: 'Design UI/UX', color: 'bg-purple-500', textColor: 'text-purple-600', bgLight: 'bg-purple-50' },
  { id: '4', name: 'Marketing Digital', color: 'bg-orange-500', textColor: 'text-orange-600', bgLight: 'bg-orange-50' },
  { id: '5', name: 'Machine Learning', color: 'bg-red-500', textColor: 'text-red-600', bgLight: 'bg-red-50' },
];

const scheduleData: Record<string, Record<string, { courseId: string; teacher: string }>> = {
  'Lundi': {
    '08:00 - 09:00': { courseId: '1', teacher: 'Jean Dupont' },
    '10:00 - 11:00': { courseId: '3', teacher: 'Sophie Petit' },
    '14:00 - 15:00': { courseId: '2', teacher: 'Marie Martin' },
  },
  'Mardi': {
    '09:00 - 10:00': { courseId: '4', teacher: 'Lucas Robert' },
    '11:00 - 12:00': { courseId: '1', teacher: 'Jean Dupont' },
    '15:00 - 16:00': { courseId: '5', teacher: 'Thomas Laurent' },
  },
  'Mercredi': {
    '08:00 - 09:00': { courseId: '2', teacher: 'Marie Martin' },
    '10:00 - 11:00': { courseId: '1', teacher: 'Jean Dupont' },
    '14:00 - 15:00': { courseId: '3', teacher: 'Sophie Petit' },
  },
  'Jeudi': {
    '09:00 - 10:00': { courseId: '5', teacher: 'Thomas Laurent' },
    '11:00 - 12:00': { courseId: '4', teacher: 'Lucas Robert' },
    '16:00 - 17:00': { courseId: '2', teacher: 'Marie Martin' },
  },
  'Vendredi': {
    '08:00 - 09:00': { courseId: '3', teacher: 'Sophie Petit' },
    '10:00 - 11:00': { courseId: '1', teacher: 'Jean Dupont' },
    '14:00 - 15:00': { courseId: '4', teacher: 'Lucas Robert' },
  },
  'Samedi': {
    '09:00 - 10:00': { courseId: '2', teacher: 'Marie Martin' },
    '11:00 - 12:00': { courseId: '5', teacher: 'Thomas Laurent' },
  },
};

export const Timetable: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('all');

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    const dates = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const getCourseForSlot = (day: string, slot: string) => {
    return scheduleData[day]?.[slot];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Emplois du temps</h1>
          <p className="text-sm text-gray-400 mt-1">Planning hebdomadaire des cours</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8]"
          >
            <option value="all">Toutes les classes</option>
            <option value="dev-web">DÃ©veloppement Web</option>
            <option value="data-science">Data Science</option>
            <option value="design">Design UI/UX</option>
          </select>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
            </button>
            <span className="text-sm font-medium text-gray-700 px-2">
              {formatDate(weekDates[0])} - {formatDate(weekDates[5])}
            </span>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-200">
          <div className="p-4 bg-gray-50 border-r border-gray-100">
            <span className="text-xs font-medium text-gray-400 uppercase">Heure</span>
          </div>
          {days.map((day, index) => (
            <div key={day} className={`p-4 border-r border-gray-100 last:border-r-0 ${index === 5 ? 'bg-gray-50/50' : ''}`}>
              <div className="text-center">
                <span className="text-xs font-medium text-gray-400 uppercase">{day}</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatDate(weekDates[index])}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {timeSlots.map((slot) => (
            <div key={slot} className="grid grid-cols-7">
              <div className="p-3 bg-gray-50 border-r border-gray-100 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">{slot}</span>
              </div>
              {days.map((day, dayIndex) => {
                const courseInfo = getCourseForSlot(day, slot);
                const course = courseInfo ? courses.find(c => c.id === courseInfo.courseId) : null;
                
                return (
                  <div 
                    key={`${day}-${slot}`}
                    className={`p-2 border-r border-gray-100 last:border-r-0 min-h-[80px] ${dayIndex === 5 ? 'bg-gray-50/30' : ''}`}
                  >
                    {course ? (
                      <div className={`h-full p-2 rounded-lg ${course.bgLight} border border-current ${course.color}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <BookOpenIcon className={`w-3.5 h-3.5 ${course.textColor}`} />
                          <span className={`text-xs font-semibold ${course.textColor}`}>
                            {course.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserGroupIcon className={`w-3 h-3 ${course.textColor}`} />
                          <span className={`text-xs ${course.textColor}`}>
                            {courseInfo.teacher}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-gray-300 text-xs">-</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {courses.map((course) => (
          <div key={course.id} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${course.color}`} />
            <span className="text-sm text-gray-600">{course.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
