import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  duration: string;
  price: string;
  teacher: string;
  level: string;
  startDate: string;
  endDate: string;
  modules: string;
  status: string;
}

const coursesData: Course[] = [
  { id: '1', name: 'DÃ©veloppement Web', code: 'DEV101', description: 'Apprenez Ã  crÃ©er des sites web modernes...', duration: '12 semaines', price: '150000', teacher: 'Jean Dupont', level: 'DÃ©butant', startDate: '2024-09-01', endDate: '2024-11-30', modules: '8', status: 'active' },
  { id: '2', name: 'Data Science', code: 'DS201', description: '', duration: '16 semaines', price: '200000', teacher: '', level: 'IntermÃ©diaire', startDate: '', endDate: '', modules: '10', status: 'active' },
  { id: '3', name: 'Design UI/UX', code: 'UX301', description: '', duration: '8 semaines', price: '120000', teacher: '', level: 'DÃ©butant', startDate: '', endDate: '', modules: '6', status: 'active' },
  { id: '4', name: 'Marketing Digital', code: 'MK401', description: '', duration: '10 semaines', price: '100000', teacher: '', level: 'IntermÃ©diaire', startDate: '', endDate: '', modules: '5', status: 'active' },
  { id: '5', name: 'Machine Learning', code: 'ML501', description: '', duration: '20 semaines', price: '250000', teacher: '', level: 'AvancÃ©', startDate: '', endDate: '', modules: '12', status: 'inactive' },
  { id: '6', name: 'CybersÃ©curitÃ©', code: 'CS601', description: '', duration: '14 semaines', price: '180000', teacher: '', level: 'AvancÃ©', startDate: '', endDate: '', modules: '8', status: 'active' },
  { id: '7', name: 'Cloud Computing', code: 'CC701', description: '', duration: '10 semaines', price: '160000', teacher: '', level: 'IntermÃ©diaire', startDate: '', endDate: '', modules: '6', status: 'active' },
  { id: '8', name: 'DevOps', code: 'DO801', description: '', duration: '12 semaines', price: '170000', teacher: '', level: 'IntermÃ©diaire', startDate: '', endDate: '', modules: '7', status: 'inactive' },
];

const durations = [
  '4 semaines',
  '6 semaines',
  '8 semaines',
  '10 semaines',
  '12 semaines',
  '16 semaines',
  '20 semaines',
  '24 semaines',
];

export const UpdateCourse: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = coursesData.find(c => c.id === id);
  
  const [formData, setFormData] = useState({
    name: course?.name || '',
    code: course?.code || '',
    description: course?.description || '',
    duration: course?.duration || '',
    price: course?.price || '',
    teacher: course?.teacher || '',
    level: course?.level || '',
    startDate: course?.startDate || '',
    endDate: course?.endDate || '',
    modules: course?.modules || '',
    status: course?.status || 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du cours est requis';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Le code du cours est requis';
    }
    if (!formData.duration) {
      newErrors.duration = 'La durÃ©e est requise';
    }
    if (!formData.price.trim()) {
      newErrors.price = 'Le prix est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }

    console.log('Updated course:', {
      id,
      ...formData,
    });
    
    navigate('/courses');
  };

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 text-lg">Cours non trouvÃ©</p>
        <button 
          onClick={() => navigate('/courses')}
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
          onClick={() => navigate(`/courses/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Modifier le cours</h1>
          <p className="text-sm text-gray-400 mt-1">Mettez Ã  jour les informations du cours</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Informations gÃ©nÃ©rales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nom du cours *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: DÃ©veloppement Web"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-[#1067a8]'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Code du cours *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Ex: DEV101"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.code 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-[#1067a8]'
                }`}
              />
              {errors.code && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3 h-3" />
                  {errors.code}
                </p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="DÃ©crivez le contenu du cours..."
                rows={4}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">DÃ©tails du cours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">DurÃ©e *</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.duration 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-[#1067a8]'
                }`}
              >
                <option value="">SÃ©lectionner la durÃ©e</option>
                {durations.map((duration) => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
              {errors.duration && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3 h-3" />
                  {errors.duration}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Prix (CFA) *</label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Ex: 150000"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.price 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-[#1067a8]'
                  }`}
                />
              </div>
              {errors.price && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3 h-3" />
                  {errors.price}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Enseignant responsable</label>
              <input
                type="text"
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                placeholder="Nom de l'enseignant"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Niveau</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              >
                <option value="">SÃ©lectionner le niveau</option>
                <option value="DÃ©butant">DÃ©butant</option>
                <option value="IntermÃ©diaire">IntermÃ©diaire</option>
                <option value="AvancÃ©">AvancÃ©</option>
                <option value="Tous niveaux">Tous niveaux</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date de dÃ©but</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date de fin</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nombre de modules</label>
              <input
                type="number"
                name="modules"
                value={formData.modules}
                onChange={handleChange}
                placeholder="Ex: 8"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
              />
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
              </select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="button"
            variant="outline"
            onClick={() => navigate(`/courses/${id}`)}
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
