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

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  subject: string;
  status: string;
  hireDate?: string;
  dateOfBirth?: string;
  avatar: string;
  education?: string;
}

const teachersData: Teacher[] = [
  { id: '1', name: 'Jean Dupont', email: 'jean@maat.com', phone: '+33 6 12 34 56 78', address: '123 Rue de Paris, 75001 Paris', subject: 'MathÃ©matiques', status: 'active', hireDate: '2020-09-01', dateOfBirth: '1975-03-15', avatar: 'JD', education: 'Doctorat en MathÃ©matiques' },
  { id: '2', name: 'Marie Martin', email: 'marie@maat.com', phone: '+33 6 23 45 67 89', subject: 'Physique', status: 'active', hireDate: '', dateOfBirth: '', avatar: 'MM', education: '' },
  { id: '3', name: 'Pierre Bernard', email: 'pierre@maat.com', subject: 'Informatique', status: 'active', hireDate: '', dateOfBirth: '', avatar: 'PB', education: '' },
  { id: '4', name: 'Sophie Petit', email: 'sophie@maat.com', subject: 'FranÃ§ais', status: 'inactive', hireDate: '', dateOfBirth: '', avatar: 'SP', education: '' },
  { id: '5', name: 'Lucas Robert', email: 'lucas@maat.com', subject: 'Anglais', status: 'active', hireDate: '', dateOfBirth: '', avatar: 'LR', education: '' },
  { id: '6', name: 'Emma Moreau', email: 'emma@maat.com', subject: 'Histoire', status: 'active', hireDate: '', dateOfBirth: '', avatar: 'EM', education: '' },
  { id: '7', name: 'Thomas Laurent', email: 'thomas@maat.com', subject: 'Chimie', status: 'active', hireDate: '', dateOfBirth: '', avatar: 'TL', education: '' },
  { id: '8', name: 'Julie Simon', email: 'julie@maat.com', subject: 'Biologie', status: 'graduated', hireDate: '', dateOfBirth: '', avatar: 'JS', education: '' },
];

const subjects = [
  'MathÃ©matiques',
  'Physique',
  'Chimie',
  'FranÃ§ais',
  'Anglais',
  'Histoire',
  'Biologie',
  'Informatique',
  'GÃ©ographie',
  'Philosophie',
];

export const UpdateTeacher: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const teacher = teachersData.find(t => t.id === id);
  
  const [formData, setFormData] = useState({
    firstName: teacher?.name.split(' ')[0] || '',
    lastName: teacher?.name.split(' ')[1] || '',
    email: teacher?.email || '',
    phone: teacher?.phone || '',
    subject: teacher?.subject || '',
    status: teacher?.status || 'active',
    birthDate: teacher?.dateOfBirth || '',
    address: teacher?.address || '',
    education: teacher?.education || '',
    hireDate: teacher?.hireDate || '',
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
    if (!formData.subject) {
      newErrors.subject = 'La matiÃ¨re est requise';
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

    console.log('Updated teacher:', {
      id,
      ...formData,
    });
    
    navigate('/teachers');
  };

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Enseignant non trouvÃ©</p>
        <button 
          onClick={() => navigate('/teachers')}
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
          onClick={() => navigate(`/teachers/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Modifier l'enseignant</h1>
          <p className="text-sm text-gray-400 mt-1">Mettez Ã  jour les informations de l'enseignant</p>
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
                  alt="Teacher" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-[#1067a8] flex flex-col items-center justify-center">
                  <span className="text-white text-3xl font-bold">{teacher.avatar}</span>
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
              <label className="block text-sm font-medium text-gray-700">TÃ©lÃ©phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+33 6 XX XX XX XX"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              />
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
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Informations professionnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">MatiÃ¨re *</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.subject 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-[#1067a8]'
                }`}
              >
                <option value="">SÃ©lectionner une matiÃ¨re</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              {errors.subject && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3 h-3" />
                  {errors.subject}
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
                <option value="inactive">Inactif</option>
                <option value="graduated">RetraitÃ©</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Formation/DiplÃ´me</label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="Doctorat, Master, Licence..."
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date d'embauche</label>
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="button"
            variant="outline"
            onClick={() => navigate(`/teachers/${id}`)}
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
