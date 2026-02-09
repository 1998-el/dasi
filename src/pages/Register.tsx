import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Register:', formData, agreeTerms);
    }, 1500);
  };

  const steps = [
    { title: 'Organisation', description: 'Informations sur votre Ã©tablissement' },
    { title: 'Compte', description: 'Vos informations personnelles' },
    { title: 'SÃ©curitÃ©', description: 'SÃ©curisez votre compte' },
  ];

  const getPasswordStrengthColor = (strength: number) => {
    switch (strength) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0: return '';
      case 1: return 'Faible';
      case 2: return 'Moyen';
      case 3: return 'Bon';
      case 4: return 'Fort';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className={`hidden lg:flex flex-1 bg-[#1067a8] items-center justify-center p-12 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-20'}`}>
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="font-semibold text-white">Maat School</h1>
              <p className="text-xs text-white/60">Gestion scolaire</p>
            </div>
          </div>

          <h2 className="text-3xl font-semibold text-white mb-6">
            Commencez votre essai gratuit
          </h2>
          <p className="text-white/70 mb-8">
            Rejoignez des centaines d'Ã©tablissements qui utilisent Maat School pour digitaliser leur gestion.
          </p>

          {/* Steps Indicator */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                  index <= currentStep ? 'bg-white/10' : 'bg-transparent'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    index < currentStep
                      ? 'bg-green-500'
                      : index === currentStep
                      ? 'bg-white text-[#1067a8]'
                      : 'bg-white/20 text-white/60'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${index <= currentStep ? 'text-white' : 'text-white/60'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-white/40">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>14 jours d'essai gratuit</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>Annulation Ã  tout moment</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>Support dÃ©diÃ©</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={`flex-1 flex items-center justify-center p-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
        <div className="w-full max-w-md">
          {/* Logo (Mobile) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#1067a8] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Maat School</h1>
              <p className="text-xs text-gray-400">Gestion scolaire</p>
            </div>
          </div>

          {/* Mobile Steps */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-900 font-medium">{steps[currentStep].title}</span>
              <span className="text-xs text-gray-400">Ã‰tape {currentStep + 1}/3</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1067a8] transition-all duration-500"
                style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {currentStep === 0 && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Votre Ã©tablissement</h2>
                <p className="text-gray-400 text-sm mb-6">Commencez par nous parler de votre organisation</p>

                <Input
                  label="Nom de l'Ã©tablissement"
                  type="text"
                  placeholder="Centre de Formation Maat"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="transition-all duration-300 focus:ring-2 focus:ring-[#1067a8]/20"
                />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taille de l'Ã©tablissement</label>
                    <select
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1067a8]/20 transition-all duration-300"
                    >
                      <option value="">SÃ©lectionner</option>
                      <option value="1-10">1-10 employÃ©s</option>
                      <option value="11-50">11-50 employÃ©s</option>
                      <option value="51-200">51-200 employÃ©s</option>
                      <option value="200+">200+ employÃ©s</option>
                    </select>
                  </div>
                  <Input
                    label="Site web"
                    type="text"
                    placeholder="www.votre-site.com"
                    className="transition-all duration-300 focus:ring-2 focus:ring-[#1067a8]/20"
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Vos informations</h2>
                <p className="text-gray-400 text-sm mb-6">Ces informations serviront pour votre compte administrateur</p>

                <Input
                  label="Nom complet"
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="transition-all duration-300 focus:ring-2 focus:ring-[#1067a8]/20"
                />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Email professionnel"
                    type="email"
                    placeholder="jean@etablissement.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="transition-all duration-300 focus:ring-2 focus:ring-[#1067a8]/20"
                  />
                  <Input
                    label="TÃ©lÃ©phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="transition-all duration-300 focus:ring-2 focus:ring-[#1067a8]/20"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fadeIn">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">SÃ©curisez votre compte</h2>
                <p className="text-gray-400 text-sm mb-6">CrÃ©ez un mot de passe fort pour protÃ©ger vos donnÃ©es</p>

                <div className="relative">
                  <Input
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="transition-all duration-300 focus:ring-2 focus:ring-[#1067a8]/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength(formData.password) >= level
                              ? getPasswordStrengthColor(passwordStrength(formData.password))
                              : 'bg-gray-100'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Force: <span className="font-medium">{getPasswordStrengthText(passwordStrength(formData.password))}</span>
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <Input
                    label="Confirmer le mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="transition-all duration-300 focus:ring-2 focus:ring-[#1067a8]/20"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <label className="flex items-start gap-3 mt-6 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#1067a8] focus:ring-[#1067a8]/20 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    J'accepte les{' '}
                    <a href="#" className="text-[#1067a8] hover:underline">Conditions d'utilisation</a>
                    {' '}et la{' '}
                    <a href="#" className="text-[#1067a8] hover:underline">Politique de confidentialitÃ©</a>
                  </span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 py-3 text-sm transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Retour
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                className={`flex-1 py-3 text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#1067a8]/20 ${currentStep === 2 && !agreeTerms ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={currentStep === 2 && !agreeTerms}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Inscription...
                  </span>
                ) : currentStep === 2 ? (
                  "CrÃ©er mon compte"
                ) : (
                  "Continuer"
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-400 mt-8">
            DÃ©jÃ  un compte ?{' '}
            <a href="/login" className="text-[#1067a8] hover:text-[#1067a8]/80 font-medium transition-colors">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
