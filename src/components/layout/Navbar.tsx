import React, { useState, useEffect } from 'react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

const navItems = [
  { title: 'Accueil', href: '/' },
  { title: 'Services', href: '/services' },
  { title: 'Tarifs', href: '/pricing' },
  { title: 'À propos', href: '/about' },
  { title: 'Carrières', href: '/careers' },
  { title: 'Contact', href: '#contact' },
];

const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
];

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If it's a link to another page, let it navigate normally
    if (href.startsWith('/')) {
      return;
    }
    
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const offsetTop = targetElement.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
    
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mini Contact Banner */}
      <div className="bg-[#1067a8] text-white py-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between text-sm">
            {/* Desktop View */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                <span>+237 682 877 106 / +237 675 345 158 / +237 658 184 703</span>
              </div>
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                <span>dataspatialintelligence@gmail.com</span>
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden flex items-center gap-6">
              <div className="relative overflow-hidden h-8">
                <div className="animate-marquee absolute top-0 left-0 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <PhoneIcon className="w-4 h-4" />
                    <span>+237 682 877 106</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <PhoneIcon className="w-4 h-4" />
                    <span>+237 675 345 158</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <PhoneIcon className="w-4 h-4" />
                    <span>+237 658 184 703</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>dataspatialintelligence@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="flex items-center gap-2 text-sm hover:text-[#fabb10] transition-colors"
                >
                  <GlobeAltIcon className="w-4 h-4" />
                  <span>{languages.find(lang => lang.code === currentLanguage)?.name}</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                
                {/* Language Dropdown */}
                {isLanguageMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLanguage(lang.code);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                          currentLanguage === lang.code 
                            ? 'text-[#1067a8] bg-[#1067a8]/5 font-medium' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav 
        className={`bg-white border-b border-gray-100  transition-all duration-300 ${
          isScrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 ">
              <img 
                src="/assets/dasi_logo.png" 
                alt="DASI Logo" 
                className="h-20 w-auto object-contain scale-102"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-gray-600 hover:text-[#1067a8] transition-colors text-sm font-medium"
                >
                  {item.title}
                </a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="outline" size="md">
                Demander un devis
              </Button>
              <Button size="md">
                Nous contacter
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-6 pb-4 animate-fade-in">
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-gray-600 hover:text-[#1067a8] transition-colors text-sm font-medium py-2"
                  >
                    {item.title}
                  </a>
                ))}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button variant="outline" size="sm" className="flex-1">
                    Demander un devis
                  </Button>
                  <Button size="sm" className="flex-1">
                    Nous contacter
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
