import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { 
  ArrowLeftIcon,
  CameraIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export const AddStudent: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    course: '',
    birthDate: '',
    gender: '',
    photo: null as File | null,
    registrationFees: true,
    tuitionFees: false,
    paymentMethod: 'cash' as 'cash' | 'mobile_money',
    tuitionPaymentMethod: 'full' as 'full' | 'installment',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validatePhoneNumber = (phone: string): boolean => {
    const cameroonianPhoneRegex = /^(\+237)?[6-9]\d{8}$/;
    return cameroonianPhoneRegex.test(phone.replace(/\s/g, ''));
  };

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
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Format: +237 6XX XX XX XX (10 chiffres aprÃ¨s +237)';
    }
    if (!formData.gender) {
      newErrors.gender = 'Le genre est requis';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = 'La date de naissance est requise';
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
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentMethodChange = (method: 'cash' | 'mobile_money') => {
    setFormData({ ...formData, paymentMethod: method });
  };

  const handleTuitionPaymentChange = (method: 'full' | 'installment') => {
    setFormData({ ...formData, tuitionPaymentMethod: method });
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentId = `MS-${Date.now().toString().slice(-6)}`;
    const totalAmount = 
      (formData.registrationFees ? registrationFees : 0) +
      (formData.tuitionFees ? (formData.tuitionPaymentMethod === 'full' ? totalFees : installmentAmount) : 0);
    
    const receiptData = {
      studentId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      course: formData.course,
      registrationFees: formData.registrationFees,
      tuitionFees: formData.tuitionFees,
      tuitionPaymentMethod: formData.tuitionPaymentMethod,
      paymentMethod: formData.paymentMethod,
      totalAmount,
      photo: photoPreview || undefined,
      date: new Date().toLocaleDateString('fr-FR'),
    };
    
    navigate('/receipt', { state: receiptData });
  };

  const courses = [
    'DÃ©veloppement Web',
    'Data Science',
    'Design UI/UX',
    'Marketing Digital',
    'Machine Learning',
    'CybersÃ©curitÃ©',
  ];

  const registrationFees = 15000;
  const totalFees = 65000;
  const installmentAmount = 32500;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/students')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ajouter un Ã©tudiant</h1>
          <p className="text-sm text-gray-400 mt-1">GÃ©rez la scolaritÃ© de l'Ã©tudiant</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-4">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <button
              type="button"
              onClick={() => {
                if (s < step || (s === 2 && step === 3)) {
                  setStep(s);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                step >= s 
                  ? 'bg-[#1067a8] text-white' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } ${s < step || (s === 2 && step === 3) ? 'cursor-pointer' : ''}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                step > s ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {step > s ? <CheckCircleIcon className="w-4 h-4" /> : s}
              </span>
              <span className="text-sm font-medium">
                {s === 1 ? 'Infos' : s === 2 ? 'Photo' : 'ScolaritÃ©'}
              </span>
            </button>
            {s < 3 && (
              <div className={`w-12 h-0.5 transition-all duration-300 ${
                step > s ? 'bg-[#1067a8]' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`transition-all duration-500 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 hidden'}`}>
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
                <label className="block text-sm font-medium text-gray-700">TÃ©lÃ©phone (Cameroun) *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+237 6XX XX XX XX"
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
                <label className="block text-sm font-medium text-gray-700">Genre *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.gender 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-[#1067a8]'
                  }`}
                >
                  <option value="">SÃ©lectionner</option>
                  <option value="male">Masculin</option>
                  <option value="female">FÃ©minin</option>
                  <option value="other">Autre</option>
                </select>
                {errors.gender && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-3 h-3" />
                    {errors.gender}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date de naissance *</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.birthDate 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-[#1067a8]'
                  }`}
                />
                {errors.birthDate && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-3 h-3" />
                    {errors.birthDate}
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
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
            </div>
          </Card>

          <div className="flex justify-end pt-4">
            <Button 
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2"
            >
              Suivant
              <ArrowLeftIcon className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </div>

        <div className={`transition-all duration-500 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 hidden'}`}>
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Photo d'identitÃ©</h2>
            <p className="text-sm text-gray-400 mb-6">(Optionnel)</p>
            <div className="flex justify-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-40 h-40 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-lg"
              >
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Student" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1067a8]/5 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl transition-all duration-300 group-hover:border-[#1067a8]">
                    <div className="w-16 h-16 bg-[#1067a8]/10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-[#1067a8]/20">
                      <CameraIcon className="w-8 h-8 text-[#1067a8]" />
                    </div>
                    <span className="text-xs text-gray-400">4Ã—4 cm</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <CameraIcon className="w-8 h-8 text-white" />
                  </div>
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
            <p className="text-center text-sm text-gray-400 mt-4">
              Format recommandÃ©: JPG, PNG. Taille max: 2MB
            </p>
          </Card>

          <div className="flex justify-between pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              PrÃ©cÃ©dent
            </Button>
            <Button 
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2"
            >
              Suivant
              <ArrowLeftIcon className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </div>

        <div className={`transition-all duration-500 ${step === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 hidden'}`}>
          <Card className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Paiements</h2>
            
            <div className="space-y-4 mb-6">
              <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                formData.registrationFees
                  ? 'border-[#1067a8] bg-[#1067a8]/5'
                  : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.registrationFees}
                      onChange={(e) => setFormData({ ...formData, registrationFees: e.target.checked })}
                      className="w-5 h-5 text-[#1067a8] rounded border-gray-300 focus:ring-[#1067a8]"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Frais d'inscription *</p>
                      <p className="text-sm text-gray-400">Obligatoire pour l'inscription</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-[#1067a8]">{registrationFees.toLocaleString()} CFA</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                formData.tuitionFees
                  ? 'border-[#1067a8] bg-[#1067a8]/5'
                  : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.tuitionFees}
                      onChange={(e) => setFormData({ ...formData, tuitionFees: e.target.checked })}
                      className="w-5 h-5 text-[#1067a8] rounded border-gray-300 focus:ring-[#1067a8]"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Frais de scolaritÃ©</p>
                      <p className="text-sm text-gray-400">Optionnel - peut Ãªtre payÃ© plus tard</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{totalFees.toLocaleString()} CFA</p>
                </div>

                {formData.tuitionFees && (
                  <div className="ml-8 space-y-3 pt-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleTuitionPaymentChange('full')}
                      className={`w-full p-3 rounded-lg border transition-all duration-300 ${
                        formData.tuitionPaymentMethod === 'full'
                          ? 'border-[#1067a8] bg-[#1067a8]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Paiement complet</span>
                        <span className="font-bold text-gray-900">{totalFees.toLocaleString()} CFA</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTuitionPaymentChange('installment')}
                      className={`w-full p-3 rounded-lg border transition-all duration-300 ${
                        formData.tuitionPaymentMethod === 'installment'
                          ? 'border-[#1067a8] bg-[#1067a8]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">2 tranches de {installmentAmount.toLocaleString()} CFA</span>
                        <span className="font-bold text-gray-900">{installmentAmount.toLocaleString()} CFA Ã— 2</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-md font-medium text-gray-900 mb-4">MÃ©thode de paiement *</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('cash')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.paymentMethod === 'cash'
                    ? 'border-[#1067a8] bg-[#1067a8]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    formData.paymentMethod === 'cash' ? 'bg-[#1067a8]' : 'bg-gray-200'
                  }`}>
                    <BanknotesIcon className={`w-5 h-5 ${
                      formData.paymentMethod === 'cash' ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <span className="font-medium text-gray-900">EspÃ¨ces</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentMethodChange('mobile_money')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.paymentMethod === 'mobile_money'
                    ? 'border-[#1067a8] bg-[#1067a8]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    formData.paymentMethod === 'mobile_money' ? 'bg-[#1067a8]' : 'bg-gray-200'
                  }`}>
                    <DevicePhoneMobileIcon className={`w-5 h-5 ${
                      formData.paymentMethod === 'mobile_money' ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <span className="font-medium text-gray-900">Mobile Money</span>
                </div>
              </button>
            </div>

            {(formData.registrationFees || formData.tuitionFees) && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900 mb-3">RÃ©capitulatif</p>
                <div className="space-y-2">
                  {formData.registrationFees && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Frais d'inscription</span>
                      <span className="font-medium">{registrationFees.toLocaleString()} CFA</span>
                    </div>
                  )}
                  {formData.tuitionFees && (
                    <>
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">1Ã¨re tranche</span>
                        <span className="font-medium">
                          {formData.tuitionPaymentMethod === 'full' ? totalFees.toLocaleString() : installmentAmount.toLocaleString()} CFA
                        </span>
                      </div>
                      {formData.tuitionPaymentMethod === 'installment' && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600">2Ã¨me tranche</span>
                          <span className="font-medium">{installmentAmount.toLocaleString()} CFA</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center justify-between py-2 mt-2">
                    <span className="font-bold text-[#1067a8]">Total</span>
                    <span className="text-xl font-bold text-[#1067a8]">
                      {(
                        (formData.registrationFees ? registrationFees : 0) +
                        (formData.tuitionFees ? (formData.tuitionPaymentMethod === 'full' ? totalFees : installmentAmount) : 0)
                      ).toLocaleString()} CFA
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="flex justify-between pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              PrÃ©cÃ©dent
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4" />
              Enregistrer
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
