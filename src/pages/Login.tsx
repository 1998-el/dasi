import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login:', { email, password, rememberMe });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className={`flex-1 flex items-center justify-center p-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#1067a8] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Maat School</h1>
              <p className="text-xs text-gray-400">Gestion scolaire</p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900">Bon retour</h2>
            <p className="text-gray-400 mt-2">Connectez-vous pour accÃ©der Ã  votre espace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="transform transition-all duration-500 delay-100">
              <Input
                type="email"
                label="Email"
                placeholder="entrez@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all duration-300 focus:ring-2 focus:ring-[#1067a8]/20"
              />
            </div>

            <div className="transform transition-all duration-500 delay-200">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Mot de passe"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <div className="flex items-center justify-between transform transition-all duration-500 delay-300">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#1067a8] focus:ring-[#1067a8]/20 cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Se souvenir de moi
                </span>
              </label>
              <a href="#" className="text-sm text-[#1067a8] hover:text-[#1067a8]/80 transition-colors">
                Mot de passe oubliÃ© ?
              </a>
            </div>

            <div className="pt-4 transform transition-all duration-500 delay-400">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#1067a8]/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-400 mt-8 transform transition-all duration-500 delay-500">
            Pas encore de compte ?{' '}
            <a href="/register" className="text-[#1067a8] hover:text-[#1067a8]/80 font-medium transition-colors">
              CrÃ©er un compte
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div
        className={`hidden lg:flex flex-1 relative overflow-hidden transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/assets/banner_maat_1)',
          }}
        />

        {/* Overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-[#1067a8]/80 via-[#1067a8]/60 to-black/50" /> */}

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 py-16">
          <div className="max-w-lg text-center">
            <h3 className="text-3xl font-semibold text-white mb-6 animate-fadeIn">
              GÃ©rez votre Ã©tablissement en toute simplicitÃ©
            </h3>
            <p className="text-white/80 text-lg mb-12 animate-fadeIn delay-100">
              Une plateforme moderne et intuitive pour digitaliser la gestion administrative et pÃ©dagogique de votre centre de formation.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 transform transition-all duration-500 hover:scale-105 hover:bg-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white font-medium">Gestion des Ã©tudiants</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 transform transition-all duration-500 delay-100 hover:scale-105 hover:bg-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-white font-medium">Suivi des enseignants</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 transform transition-all duration-500 delay-200 hover:scale-105 hover:bg-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-white font-medium">Emplois du temps</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 transform transition-all duration-500 delay-300 hover:scale-105 hover:bg-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-white font-medium">Gestion des paiements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm py-4 px-8">
          <div className="flex items-center justify-between text-white/80 text-sm">
            <p>Â© 2026 Maat School</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">ConfidentialitÃ©</a>
              <a href="#" className="hover:text-white transition-colors">Conditions</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
