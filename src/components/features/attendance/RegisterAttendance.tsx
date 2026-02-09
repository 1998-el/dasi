import React, { useState } from 'react';
import { 
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late';
}

interface RegisterAttendanceProps {
  students: Student[];
  date: string;
  onClose: () => void;
  onSubmit: (records: AttendanceRecord[]) => void;
}

export const RegisterAttendance: React.FC<RegisterAttendanceProps> = ({ 
  students, 
  date, 
  onClose, 
  onSubmit 
}) => {
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  const handleMark = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const records: AttendanceRecord[] = Object.entries(attendance)
      .filter(([_, status]) => status)
      .map(([studentId, status]) => ({ studentId, status }));
    onSubmit(records);
  };

  const handleMarkAll = (status: 'present' | 'absent' | 'late') => {
    const allAttendance: Record<string, 'present' | 'absent' | 'late'> = {};
    students.forEach((student) => {
      allAttendance[student.id] = status;
    });
    setAttendance(allAttendance);
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const lateCount = Object.values(attendance).filter(s => s === 'late').length;
  const markedCount = presentCount + absentCount + lateCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1067a8]/5 rounded-xl flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-[#1067a8]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Enregistrer la prÃ©sence</h2>
              <p className="text-sm text-gray-400">{date}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-500">
              {markedCount} / {students.length} marquÃ©s
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleMarkAll('present')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Tout prÃ©sent
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
            >
              <XCircleIcon className="w-4 h-4" />
              Tout absent
            </button>
          </div>
        </div>

        {/* Students List */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-3">
            {students.map((student) => {
              const status = attendance[student.id];
              
              return (
                <div 
                  key={student.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    status === 'present' ? 'border-green-500 bg-green-50' :
                    status === 'absent' ? 'border-red-500 bg-red-50' :
                    status === 'late' ? 'border-yellow-500 bg-yellow-50' :
                    'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1067a8]/5 flex items-center justify-center">
                        <span className="text-sm font-semibold text-[#1067a8]">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.course}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMark(student.id, 'present')}
                        className={`p-2.5 rounded-lg transition-all ${
                          status === 'present'
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                        }`}
                        title="PrÃ©sent"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMark(student.id, 'late')}
                        className={`p-2.5 rounded-lg transition-all ${
                          status === 'late'
                            ? 'bg-yellow-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600'
                        }`}
                        title="Retard"
                      >
                        <ClockIcon className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMark(student.id, 'absent')}
                        className={`p-2.5 rounded-lg transition-all ${
                          status === 'absent'
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
                        }`}
                        title="Absent"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">{presentCount} PrÃ©sents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-sm text-gray-600">{lateCount} Retards</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm text-gray-600">{absentCount} Absents</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#1067a8] text-white rounded-lg text-sm font-medium hover:bg-[#1067a8]/90 transition-colors flex items-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
