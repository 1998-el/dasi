export interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  status: 'active' | 'graduated' | 'inactive';
  avatar?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: 'active' | 'inactive';
}

export interface Course {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  credits: number;
}

export interface Module {
  id: string;
  courseId: string;
  name: string;
  description: string;
  duration: number;
}

export interface ModuleSession {
  id: string;
  moduleId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
  date: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}
