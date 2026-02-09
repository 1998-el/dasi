import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const students = [
  { id: '1', name: 'Alice Johnson', email: 'alice@email.com', course: 'DÃ©veloppement Web', present: 45, absent: 3, late: 2 },
  { id: '2', name: 'Bob Smith', email: 'bob@email.com', course: 'Data Science', present: 42, absent: 5, late: 1 },
  { id: '3', name: 'Carol White', email: 'carol@email.com', course: 'Design UI/UX', present: 48, absent: 1, late: 0 },
  { id: '4', name: 'David Brown', email: 'david@email.com', course: 'Marketing Digital', present: 40, absent: 6, late: 3 },
  { id: '5', name: 'Emma Wilson', email: 'emma@email.com', course: 'DÃ©veloppement Web', present: 47, absent: 2, late: 1 },
  { id: '6', name: 'Frank Miller', email: 'frank@email.com', course: 'Data Science', present: 44, absent: 4, late: 2 },
  { id: '7', name: 'Grace Lee', email: 'grace@email.com', course: 'Design UI/UX', present: 46, absent: 2, late: 0 },
  { id: '8', name: 'Henry Taylor', email: 'henry@email.com', course: 'Marketing Digital', present: 43, absent: 5, late: 2 },
];

const attendanceRecords = [
  { date: '2024-12-09', day: 'Lundi', present: 42, absent: 6, late: 2 },
  { date: '2024-12-10', day: 'Mardi', present: 45, absent: 3, late: 1 },
  { date: '2024-12-11', day: 'Mercredi', present: 44, absent: 4, late: 2 },
  { date: '2024-12-12', day: 'Jeudi', present: 46, absent: 2, late: 1 },
  { date: '2024-12-13', day: 'Vendredi', present: 43, absent: 5, late: 3 },
  { date: '2024-12-14', day: 'Samedi', present: 38, absent: 8, late: 4 },
];

export const Attendance: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2024-12-14');
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({
    '1': 'present',
    '2': 'present',
    '3': 'present',
    '4': 'late',
    '5': 'present',
    '6': 'absent',
    '7': 'present',
    '8': 'present',
  });

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const courses = ['all', ...Array.from(new Set(students.map(s => s.course)))];

  const totalPresent = Object.values(attendance).filter(a => a === 'present').length;
  const totalAbsent = Object.values(attendance).filter(a => a === 'absent').length;
  const totalLate = Object.values(attendance).filter(a => a === 'late').length;

  const calculateRate = (count: number, total: number) => {
    return ((count / total) * 100).toFixed(1);
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance({ ...attendance, [studentId]: status });
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">PrÃ©sence</h1>
          <p className="text-sm text-gray-400 mt-1">Gestion des prÃ©sences et absences</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8]"
          >
            {courses.map(course => (
              <option key={course} value={course}>
                {course === 'all' ? 'Tous les cours' : course}
              </option>
            ))}
          </select>
          <button 
            onClick={() => navigate('/attendance/add')}
            className="px-4 py-2 bg-[#1067a8] text-white rounded-lg text-sm font-medium hover:bg-[#1067a8]/90 flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Nouvelle prÃ©sence
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">PrÃ©sents aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{totalPresent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Absents aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{totalAbsent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Retards aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{totalLate}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1067a8]/5 rounded-xl flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-[#1067a8]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Taux de prÃ©sence</p>
              <p className="text-2xl font-bold text-gray-900">
                {calculateRate(totalPresent, students.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDate('2024-12-13')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{selectedDate}</span>
              </div>
              <button
                onClick={() => setSelectedDate('2024-12-15')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-[#1067a8]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Ã‰tudiant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Cours
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                  PrÃ©sent
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Absent
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Retard
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1067a8]/5 flex items-center justify-center">
                        <span className="text-sm font-semibold text-[#1067a8]">
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
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'present')}
                      className={`p-2 rounded-lg transition-all ${
                        attendance[student.id] === 'present'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-green-50'
                      }`}
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'absent')}
                      className={`p-2 rounded-lg transition-all ${
                        attendance[student.id] === 'absent'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-50'
                      }`}
                    >
                      <XCircleIcon className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'late')}
                      className={`p-2 rounded-lg transition-all ${
                        attendance[student.id] === 'late'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-yellow-50'
                      }`}
                    >
                      <ClockIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique de la semaine</h3>
            <div className="space-y-3">
              {attendanceRecords.map((record, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{record.day} {record.date}</span>
                    <span className="text-xs text-gray-400">{calculateRate(record.present, 50)}% prÃ©sence</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(record.present / 50) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${(record.absent / 50) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${(record.late / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3 text-green-500" />
                      {record.present}
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircleIcon className="w-3 h-3 text-red-400" />
                      {record.absent}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3 text-yellow-400" />
                      {record.late}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">LÃ©gende</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg bg-green-100 text-green-600">
                  <CheckCircleIcon className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">PrÃ©sent</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg bg-red-100 text-red-600">
                  <XCircleIcon className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">Absent</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                  <ClockIcon className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">Retard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
