import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserCircleIcon, BellIcon, LockClosedIcon, UsersIcon, PaintBrushIcon, LanguageIcon, PlusIcon, TrashIcon, ShieldCheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface SettingsField {
  label: string;
  type: string;
  value?: string;
}

interface SettingsToggle {
  label: string;
  enabled: boolean;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending';
}

interface SettingsSection {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields?: SettingsField[];
  toggles?: SettingsToggle[];
}

const settingsSections: SettingsSection[] = [
  {
    title: 'Profil',
    description: 'GÃ©rez vos informations personnelles',
    icon: UserCircleIcon,
    fields: [
      { label: 'Nom complet', type: 'text', value: 'Admin User' },
      { label: 'Email', type: 'email', value: 'admin@maat.com' },
      { label: 'TÃ©lÃ©phone', type: 'tel', value: '+33 6 12 34 56 78' },
      { label: 'Poste', type: 'text', value: 'Administrateur' },
    ],
  },
  {
    title: 'Langue',
    description: 'Configurez la langue de l\'interface',
    icon: LanguageIcon,
    fields: [
      { label: 'Langue principale', type: 'text', value: 'FranÃ§ais' },
      { label: 'Langue secondaire', type: 'text', value: 'English' },
    ],
  },
  {
    title: 'Apparence',
    description: 'Personnalisez l\'apparence de l\'interface',
    icon: PaintBrushIcon,
    toggles: [
      { label: 'Mode sombre', enabled: false },
      { label: 'Mode clair', enabled: true },
      { label: 'Suivre le systÃ¨me', enabled: false },
    ],
    fields: [
      { label: 'Couleur du thÃ¨me', type: 'text', value: 'Bleu' },
    ],
  },
  {
    title: 'Notifications',
    description: 'Configurez vos prÃ©fÃ©rences de notification',
    icon: BellIcon,
    toggles: [
      { label: 'Emails de notification', enabled: true },
      { label: 'Notifications push', enabled: true },
      { label: 'Rappels de cours', enabled: false },
    ],
  },
  {
    title: 'SÃ©curitÃ©',
    description: 'GÃ©rez la sÃ©curitÃ© de votre compte',
    icon: LockClosedIcon,
    fields: [
      { label: 'Mot de passe actuel', type: 'password' },
      { label: 'Nouveau mot de passe', type: 'password' },
      { label: 'Confirmer le mot de passe', type: 'password' },
    ],
  },
];

export const Settings: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 1, name: 'Admin User', email: 'admin@maat.com', role: 'Administrateur', status: 'active' },
    { id: 2, name: 'Jean Dupont', email: 'jean.dupont@maat.com', role: 'Enseignant', status: 'active' },
    { id: 3, name: 'Marie Martin', email: 'marie.martin@maat.com', role: 'SecrÃ©taire', status: 'pending' },
  ]);
  
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Utilisateur' });
  const [activeTab, setActiveTab] = useState<'settings' | 'team'>('settings');
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const roles = ['Administrateur', 'Enseignant', 'SecrÃ©taire', 'Ã‰tudiant', 'Utilisateur'];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const addMember = () => {
    if (newMember.name && newMember.email) {
      setTeamMembers([
        ...teamMembers,
        {
          id: Date.now(),
          name: newMember.name,
          email: newMember.email,
          role: newMember.role,
          status: 'pending',
        },
      ]);
      setNewMember({ name: '', email: '', role: 'Utilisateur' });
    }
  };

  const removeMember = (id: number) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrateur':
        return 'bg-purple-100 text-purple-800';
      case 'Enseignant':
        return 'bg-blue-100 text-blue-800';
      case 'SecrÃ©taire':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-8 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className={`w-full max-w-4xl transform transition-all duration-500 delay-100 ease-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="transform transition-all duration-500 delay-200 ease-out">
            <h1 className="text-3xl font-semibold text-gray-900">ParamÃ¨tres</h1>
            <p className="text-sm text-gray-400 mt-1">GÃ©rez votre compte, votre Ã©quipe et vos prÃ©fÃ©rences</p>
          </div>
          <div className="flex gap-2 transform transition-all duration-500 delay-300 ease-out">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
                activeTab === 'settings'
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ParamÃ¨tres
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-out transform hover:scale-105 ${
                activeTab === 'team'
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ã‰quipe & RÃ´les
            </button>
          </div>
        </div>

        {activeTab === 'settings' ? (
          <div className="space-y-4">
            {settingsSections.map((section, index) => (
              <div
                key={section.title}
                className={`transform transition-all duration-500 ease-out`}
              >
                <Card className="overflow-hidden transition-all duration-500 ease-out hover:shadow-xl hover:shadow-gray-200/50">
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full flex items-center justify-between p-5 transition-all duration-300 ease-out hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 bg-gray-50 rounded-xl transition-transform duration-300 ${expandedSections[index] ? 'scale-110' : ''}`}>
                        <section.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-base font-medium text-gray-900">{section.title}</h2>
                        <p className="text-xs text-gray-400">{section.description}</p>
                      </div>
                    </div>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-gray-400 transition-transform duration-500 ease-out ${expandedSections[index] ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div
                    ref={(el) => { contentRefs.current[index] = el; }}
                    className={`transition-all duration-500 ease-out overflow-hidden ${
                      expandedSections[index] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-6 pt-2">
                      {section.fields && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
                          {section.fields.map((field, fieldIndex) => (
                            <div
                              key={fieldIndex}
                              className="transform transition-all duration-300 ease-out"
                              style={{ transitionDelay: `${fieldIndex * 50}ms` }}
                            >
                              <Input
                                type={field.type}
                                label={field.label}
                                defaultValue={field.value}
                                className="transition-all duration-300 focus:ring-2 focus:ring-gray-900/20"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {section.toggles && (
                        <div className="space-y-3 animate-fadeIn">
                          {section.toggles.map((toggle, toggleIndex) => (
                            <div
                              key={toggleIndex}
                              className="flex items-center justify-between py-3 transform transition-all duration-300 ease-out cursor-pointer"
                              style={{ transitionDelay: `${toggleIndex * 50}ms` }}
                            >
                              <span className="text-sm text-gray-700">{toggle.label}</span>
                              <button
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 ease-out ${
                                  toggle.enabled ? 'bg-gray-900' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-out ${
                                    toggle.enabled ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 pt-5 border-t border-gray-100 flex justify-end animate-fadeIn">
                        <Button
                          variant="primary"
                          className="transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-lg shadow-gray-900/20 hover:shadow-xl"
                        >
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div
              className={`transform transition-all duration-500 ease-out`}
              style={{ transitionDelay: '400ms' }}
            >
              <Card className="p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 ease-out">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <UsersIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-medium text-gray-900">Gestion des membres</h2>
                    <p className="text-xs text-gray-400">Ajoutez et gÃ©rez les membres de votre Ã©quipe</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                  <div className="transform transition-all duration-300 ease-out hover:scale-[1.02]">
                    <Input
                      type="text"
                      label="Nom complet"
                      placeholder="Entrez le nom"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="transition-all duration-300"
                    />
                  </div>
                  <div className="transform transition-all duration-300 ease-out hover:scale-[1.02]">
                    <Input
                      type="email"
                      label="Email"
                      placeholder="entrez@email.com"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      className="transition-all duration-300"
                    />
                  </div>
                  <div className="transform transition-all duration-300 ease-out hover:scale-[1.02]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">RÃ´le</label>
                    <select
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-transparent transition-all duration-300"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mb-6">
                  <Button
                    variant="primary"
                    onClick={addMember}
                    className="transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-lg shadow-gray-900/20"
                  >
                    <PlusIcon className="w-4 h-4 mr-2 inline" />
                    Ajouter un membre
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="pb-4 text-sm font-medium text-gray-600">Membre</th>
                        <th className="pb-4 text-sm font-medium text-gray-600">RÃ´le</th>
                        <th className="pb-4 text-sm font-medium text-gray-600">Statut</th>
                        <th className="pb-4 text-sm font-medium text-gray-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member, index) => (
                        <tr
                          key={member.id}
                          className="border-b border-gray-100 transform transition-all duration-500 ease-out hover:bg-gray-50"
                          style={{ transitionDelay: `${index * 50}ms` }}
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110">
                                <UserCircleIcon className="w-6 h-6 text-gray-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                <p className="text-xs text-gray-400">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)} transition-all duration-300`}>
                              <ShieldCheckIcon className="w-3.5 h-3.5" />
                              {member.role}
                            </span>
                          </td>
                          <td className="py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                                member.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {member.status === 'active' ? 'Actif' : 'En attente'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => removeMember(member.id)}
                              className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 ease-out transform hover:scale-110 hover:rotate-3"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
