import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import usePrompt from '../hooks/usePrompt';
import { useToast } from '../components/ui';

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  country_code?: string;
  phone_num?: string;
  start_convo?: boolean;
  daily_phrase?: boolean;
}

interface CountryCode {
  countrycode: string;
  countryname: string;
}

const ProfileConfig = () => {
  const { t } = useTranslation('profile');
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedProfile, setUpdatedProfile] = useState<Profile | null>(null);
  const [phoneError, setPhoneError] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  usePrompt("You have unsaved changes. Are you sure you want to leave the page?", hasUnsavedChanges);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, country_code, phone_num, start_convo, daily_phrase')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setUpdatedProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('countrycodes')
        .select('countrycode, countryname')
        .order('countryname', { ascending: true });

      if (error) {
        console.error('Error fetching country codes:', error);
        throw error;
      }
      console.log('Country codes data:', data);
      if (data) {
        setCountryCodes(data);
      }
    } catch (err) {
      console.error('Error:', err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCountryCodes();
  }, []);

  const handleUpdate = (field: string, value: string | boolean) => {
    setHasUnsavedChanges(true);
    if (field === 'phone_num' && typeof value === 'string' && /\D/.test(value)) {
      setPhoneError(true);
    } else {
      setPhoneError(false);
    }
    setUpdatedProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleCountryCodeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    handleUpdate('country_code', event.target.value);
  };

  const handleSubmit = async () => {
    try {
      if (!updatedProfile) return;
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', updatedProfile.id);

      if (error) throw error;
      setProfile(updatedProfile);
      setHasUnsavedChanges(false);
      toast.success(t('config.updateSuccessful'));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4">{t('config.loading')}</div>;
  if (error) return <div className="p-4 text-error-500">{t('config.error')}: {error}</div>;
  if (!profile) return <div className="p-4">{t('config.noProfile')}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-error-500">
      <h2 className="text-2xl font-bold mb-6 text-primary-600">{t('config.title')}</h2>

      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary-600 mb-1">
            {t('config.username')}
          </label>
          <input
            type="text"
            value={updatedProfile?.username || ''}
            onChange={(e) => handleUpdate('username', e.target.value)}
            className="input border border-black bg-gray-200 cursor-not-allowed"
            disabled
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-primary-600 mb-1">
            {t('config.name')}
          </label>
          <input
            type="text"
            value={updatedProfile?.full_name || ''}
            onChange={(e) => handleUpdate('full_name', e.target.value)}
            className="input border border-black"
          />
        </div>
        <div className="flex flex-col relative">
          <label className="text-sm font-medium text-primary-600 mb-1">
            {t('config.countryCode')}
          </label>
          <select
            value={updatedProfile?.country_code || ''}
            onChange={handleCountryCodeSelect}
            className="input border border-black"
          >
            <option value="" disabled>{t('config.selectCountryCode')}</option>
            {countryCodes.map((code, index) => (
              <option key={index} value={code.countrycode}>
                {code.countryname} ({code.countrycode})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col relative">
          <label className="text-sm font-medium text-primary-600 mb-1">
            {t('config.phoneNumber')}
          </label>
          <input
            type="text"
            value={updatedProfile?.phone_num || ''}
            onChange={(e) => handleUpdate('phone_num', e.target.value.replace(/\D/g, ''))}
            className="input border border-black"
          />
          {phoneError && (
            <div className="absolute top-full mt-1 text-xs text-error-500 bg-white border border-error-500 p-1 rounded">
              {t('config.phoneNumberError')}
            </div>
          )}
        </div>
        <div className="border border-black p-4 rounded-lg mt-4">
          <h3 className="text-lg font-bold mb-4">{t('config.textOptIn.title')}</h3>
          <div className="flex flex-col mb-4">
            <label className="text-sm font-medium text-primary-600 mb-1">
              {t('config.textOptIn.conversationStarters')}
            </label>
            <input
              type="checkbox"
              checked={updatedProfile?.start_convo || false}
              onChange={(e) => handleUpdate('start_convo', e.target.checked)}
              className="h-5 w-5 text-accent-500 border-error-500 rounded focus:ring-accent-500"
            />
          </div>
          <div className="flex flex-col mb-4">
            <label className="text-sm font-medium text-primary-600 mb-1">
              {t('config.textOptIn.phraseOfTheDay')}
            </label>
            <input
              type="checkbox"
              checked={updatedProfile?.daily_phrase || false}
              onChange={(e) => handleUpdate('daily_phrase', e.target.checked)}
              className="h-5 w-5 text-accent-500 border-error-500 rounded focus:ring-accent-500"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition-colors"
        >
          {t('config.updateProfile')}
        </button>
      </div>
    </div>
  );
};

export default ProfileConfig;