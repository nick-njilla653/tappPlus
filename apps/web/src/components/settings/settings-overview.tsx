'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { 
  UserIcon,
  BellIcon,
  CogIcon,
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  speciality: string;
  hospital: string;
  address: string;
}

interface NotificationSettings {
  emailReminders: boolean;
  smsReminders: boolean;
  pushNotifications: boolean;
  urgentAlerts: boolean;
  weeklyReports: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
}

// Interface pour les données de l'API utilisateur
interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  doctor?: {
    speciality?: string;
    hospital?: string;
    address?: string;
  };
}

// Fonction pour mapper les données de l'API vers l'interface UserProfile
const mapApiUserToProfile = (apiUser: ApiUser): UserProfile => {
  return {
    fullName: `Dr. ${apiUser.firstName} ${apiUser.lastName}`,
    email: apiUser.email,
    phone: apiUser.phone || '',
    speciality: apiUser.doctor?.speciality || 'Médecine Générale',
    hospital: apiUser.doctor?.hospital || 'Hôpital Central de Douala',
    address: apiUser.doctor?.address || 'Douala, Cameroun'
  };
};

// Valeurs par défaut pour les notifications et la sécurité
const defaultNotifications: NotificationSettings = {
  emailReminders: true,
  smsReminders: true,
  pushNotifications: false,
  urgentAlerts: true,
  weeklyReports: true
};

const defaultSecurity: SecuritySettings = {
  twoFactorAuth: false,
  sessionTimeout: 30,
  passwordExpiry: 90
};

export function SettingsOverview() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    phone: '',
    speciality: '',
    hospital: '',
    address: ''
  });
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [security, setSecurity] = useState<SecuritySettings>(defaultSecurity);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Chargement du profil utilisateur via React Query
  const { data: userData, isLoading, error, refetch } = useQuery(
    'user-profile',
    () => apiClient.getProfile(),
    {
      onSuccess: (data) => {
        const mappedProfile = mapApiUserToProfile(data);
        setProfile(mappedProfile);
        setLoading(false);
      },
      onError: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        toast.error('Erreur lors du chargement du profil utilisateur');
        setLoading(false);
      }
    }
  );

  const tabs = [
    { id: 'profile', name: 'Profil', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Sécurité', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'Préférences', icon: CogIcon },
  ];

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSecurityChange = (key: keyof SecuritySettings, value: any) => {
    setSecurity(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProfileChange = (key: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <UserIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p className="mt-1 text-sm text-gray-500">
          Impossible de charger les paramètres. Veuillez réessayer.
        </p>
        <button onClick={() => refetch()} className="mt-4 btn-primary">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Informations du profil
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-primary"
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) => handleProfileChange('fullName', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="speciality" className="block text-sm font-medium text-gray-700">
                  Spécialité
                </label>
                <input
                  type="text"
                  name="speciality"
                  id="speciality"
                  value={profile.speciality}
                  onChange={(e) => handleProfileChange('speciality', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="hospital" className="block text-sm font-medium text-gray-700">
                  Hôpital/Clinique
                </label>
                <input
                  type="text"
                  name="hospital"
                  id="hospital"
                  value={profile.hospital}
                  onChange={(e) => handleProfileChange('hospital', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={profile.address}
                  onChange={(e) => handleProfileChange('address', e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50"
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Annuler
                </button>
                <button className="btn-primary">
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Sauvegarder
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              Préférences de notification
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Rappels par email</h4>
                    <p className="text-sm text-gray-500">Recevoir des rappels par email</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('emailReminders')}
                  className={`${
                    notifications.emailReminders ? 'bg-primary-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.emailReminders ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Rappels par SMS</h4>
                    <p className="text-sm text-gray-500">Recevoir des rappels par SMS</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('smsReminders')}
                  className={`${
                    notifications.smsReminders ? 'bg-primary-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.smsReminders ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Notifications push</h4>
                    <p className="text-sm text-gray-500">Recevoir des notifications push</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('pushNotifications')}
                  className={`${
                    notifications.pushNotifications ? 'bg-primary-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Alertes urgentes</h4>
                    <p className="text-sm text-gray-500">Recevoir des alertes pour les cas urgents</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('urgentAlerts')}
                  className={`${
                    notifications.urgentAlerts ? 'bg-primary-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.urgentAlerts ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Rapports hebdomadaires</h4>
                    <p className="text-sm text-gray-500">Recevoir un résumé hebdomadaire</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('weeklyReports')}
                  className={`${
                    notifications.weeklyReports ? 'bg-primary-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      notifications.weeklyReports ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Paramètres de sécurité
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Authentification à deux facteurs</h4>
                      <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSecurityChange('twoFactorAuth', !security.twoFactorAuth)}
                    className={`${
                      security.twoFactorAuth ? 'bg-primary-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        security.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>

                <div>
                  <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
                    Délai d'expiration de session (minutes)
                  </label>
                  <select
                    id="sessionTimeout"
                    name="sessionTimeout"
                    value={security.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 heure</option>
                    <option value={120}>2 heures</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="passwordExpiry" className="block text-sm font-medium text-gray-700">
                    Expiration du mot de passe (jours)
                  </label>
                  <select
                    id="passwordExpiry"
                    name="passwordExpiry"
                    value={security.passwordExpiry}
                    onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value={30}>30 jours</option>
                    <option value={60}>60 jours</option>
                    <option value={90}>90 jours</option>
                    <option value={180}>180 jours</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Changer le mot de passe
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Mot de passe actuel
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      id="currentPassword"
                      className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <button className="btn-primary">
                    <KeyIcon className="h-4 w-4 mr-2" />
                    Changer le mot de passe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              Préférences de l'application
            </h3>

            <div className="space-y-6">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Langue
                </label>
                <select
                  id="language"
                  name="language"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                  Fuseau horaire
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="Africa/Douala">Afrique/Douala (GMT+1)</option>
                  <option value="Africa/Lagos">Afrique/Lagos (GMT+1)</option>
                  <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                </select>
              </div>

              <div>
                <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                  Format de date
                </label>
                <select
                  id="dateFormat"
                  name="dateFormat"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                  Thème
                </label>
                <select
                  id="theme"
                  name="theme"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="btn-primary">
                <CheckIcon className="h-4 w-4 mr-2" />
                Sauvegarder les préférences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
