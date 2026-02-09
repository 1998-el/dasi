import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  ArrowLeftIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  course: string;
  status: string;
  enrollmentDate: string;
  dateOfBirth: string;
  grade: string;
  avatar: string;
}

const studentsData: Student[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@email.com', phone: '+33 6 12 34 56 78', address: '123 Rue de Paris, 75001 Paris', course: 'DÃ©veloppement Web', status: 'active', enrollmentDate: '2024-09-15', dateOfBirth: '2000-05-20', grade: 'Licence 2', avatar: 'AJ' },
  { id: '2', name: 'Bob Smith', email: 'bob@email.com', phone: '', address: '', course: 'Data Science', status: 'active', enrollmentDate: '', dateOfBirth: '', grade: '', avatar: 'BS' },
  { id: '3', name: 'Carol White', email: 'carol@email.com', phone: '', address: '', course: 'Design UI/UX', status: 'graduated', enrollmentDate: '', dateOfBirth: '', grade: '', avatar: 'CW' },
  { id: '4', name: 'David Brown', email: 'david@email.com', phone: '', address: '', course: 'Marketing Digital', status: 'inactive', enrollmentDate: '', dateOfBirth: '', grade: '', avatar: 'DB' },
  { id: '5', name: 'Emma Wilson', email: 'emma@email.com', phone: '', address: '', course: 'DÃ©veloppement Web', status: 'active', enrollmentDate: '', dateOfBirth: '', grade: '', avatar: 'EW' },
  { id: '6', name: 'Frank Miller', email: 'frank@email.com', phone: '', address: '', course: 'Data Science', status: 'active', enrollmentDate: '', dateOfBirth: '', grade: '', avatar: 'FM' },
  { id: '7', name: 'Grace Lee', email: 'grace@email.com', phone: '', address: '', course: 'Design UI/UX', status: 'active', enrollmentDate: '', dateOfBirth: '', grade: '', avatar: 'GL' },
  { id: '8', name: 'Henry Taylor', email: 'henry@email.com', phone: '', address: '', course: 'Marketing Digital', status: 'graduated', enrollmentDate: '', dateOfBirth: '', grade: '', avatar: 'HT' },
  { id: '9', name: 'Isabel Garcia', email: 'isabel@email.com', phone: '', address: '', course: 'DÃ©veloppement Web', status: 'active', enrollmentDate: '', dateOfBirth: '', grade: '', avatar: 'IG' },
  { id: '10', name: 'Jack Chen', email: 'jack@email.com', phone: '', address: '', course: 'Data Science', status: 'inactive', enrollmentDate: '', dateOfBirth: '', grade: '', avatar: 'JC' },
  { id: '11', name: 'Karen Martinez', email: 'karen@email.com', phone: '', address: '', course: 'Design UI/UX', status: 'active', enrollmentDate: '', dateOfBirth: '', grade: '', avatar: 'KM' },
  { id: '12', name: 'Leo Kim', email: 'leo@kim.com', phone: '', address: '', course: 'Marketing Digital', status: 'active', enrollmentDate: '', dateOfBirth: '', grade: '', avatar: 'LK' },
];

const courses = [
  'DÃ©veloppement Web',
  'Data Science',
  'Design UI/UX',
  'Marketing Digital',
  'Machine Learning',
  'CybersÃ©curitÃ©',
];

export const UpdateStudent: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = studentsData.find(s => s.id === id);
  
  const [formData, setFormData] = useState({
    firstName: student?.name.split(' ')[0] || '',
    lastName: student?.name.split(' ')[1] || '',
    email: student?.email || '',
    phone: student?.phone || '',
    address: student?.address || '',
    course: student?.course || '',
    status: student?.status || 'active',
    birthDate: student?.dateOfBirth || '',
    grade: student?.grade || '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prÃ©nom est requis';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le tÃ©lÃ©phone est requis';
    }
    if (!formData.course) {
      newErrors.course = 'Le cours est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }

    console.log('Updated student:', {
      id,
      ...formData,
    });
    
    navigate('/students');
  };

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(`/students/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Modifier l'Ã©tudiant</h1>
          <p className="text-sm text-gray-400 mt-1">Mettez Ã  jour les informations de l'Ã©tudiant</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Photo d'identitÃ©</h2>
          <div className="flex justify-center mb-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-lg"
            >
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Student" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-[#1067a8] flex flex-col items-center justify-center">
                  <span className="text-white text-3xl font-bold">{student.avatar}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <p className="text-center text-sm text-gray-400">
            Cliquez pour changer la photo
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Informations personnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">PrÃ©nom *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Entrez le prÃ©nom"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.firstName 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-[#1067a8]'
                }`}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3 h-3" />
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nom *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Entrez le nom"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.lastName 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-[#1067a8]'
                }`}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3 h-3" />
                  {errors.lastName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@exemple.com"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-[#1067a8]'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">TÃ©lÃ©phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+33 6 XX XX XX XX"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.phone 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-[#1067a8]'
                }`}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Adresse complÃ¨te"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cours *</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.course 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-[#1067a8]'
                }`}
              >
                <option value="">SÃ©lectionner un cours</option>
                {courses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              {errors.course && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3 h-3" />
                  {errors.course}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              >
                <option value="active">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="graduated">DiplÃ´mÃ©</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Niveau</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="Licence 1, Master 2, etc."
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="button"
            variant="outline"
            onClick={() => navigate(`/students/${id}`)}
          >
            Annuler
          </Button>
          <Button type="submit" className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4" />
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
};
