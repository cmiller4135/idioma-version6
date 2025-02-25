import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import usePrompt from '../hooks/usePrompt';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedProfile, setUpdatedProfile] = useState<Profile | null>(null);
  const [phoneError, setPhoneError] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
  const [filteredCountryCodes, setFilteredCountryCodes] = useState<CountryCode[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const navigate = useNavigate();

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

  const handleUpdate = (field: string, value: any) => {
    setHasUnsavedChanges(true);
    if (field === 'phone_num' && /\D/.test(value)) {
      setPhoneError(true);
    } else {
      setPhoneError(false);
    }
    setUpdatedProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleCountryCodeChange = (value: string) => {
    handleUpdate('country_code', value);
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
      alert("Update Successful");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-[#E63946]">Error: {error}</div>;
  if (!profile) return <div className="p-4">No profile found</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-[#E63946]">
      <h2 className="text-2xl font-bold mb-6 text-[#264653]">Profile Configuration</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-[#264653] mb-1">
            Username
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
          <label className="text-sm font-medium text-[#264653] mb-1">
            Name
          </label>
          <input
            type="text"
            value={updatedProfile?.full_name || ''}
            onChange={(e) => handleUpdate('full_name', e.target.value)}
            className="input border border-black"
          />
        </div>
        <div className="flex flex-col relative">
          <label className="text-sm font-medium text-[#264653] mb-1">
            The Country Code
          </label>
          <select
            value={updatedProfile?.country_code || ''}
            onChange={handleCountryCodeSelect}
            className="input border border-black"
          >
            <option value="" disabled>Select a country code</option>
            {countryCodes.map((code, index) => (
              <option key={index} value={code.countrycode}>
                {code.countryname} ({code.countrycode})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col relative">
          <label className="text-sm font-medium text-[#264653] mb-1">
            Phone Number
          </label>
          <input
            type="text"
            value={updatedProfile?.phone_num || ''}
            onChange={(e) => handleUpdate('phone_num', e.target.value.replace(/\D/g, ''))}
            className="input border border-black"
          />
          {phoneError && (
            <div className="absolute top-full mt-1 text-xs text-[#E63946] bg-white border border-[#E63946] p-1 rounded">
              Please type only the numbers of your phone number.
            </div>
          )}
        </div>
        <div className="border border-black p-4 rounded-lg mt-4">
          <h3 className="text-lg font-bold mb-4">Yes! I want to receive texts: I Opt-In for the following messages</h3>
          <div className="flex flex-col mb-4">
            <label className="text-sm font-medium text-[#264653] mb-1">
              Conversation Starters
            </label>
            <input
              type="checkbox"
              checked={updatedProfile?.start_convo || false}
              onChange={(e) => handleUpdate('start_convo', e.target.checked)}
              className="h-5 w-5 text-[#E9C46A] border-[#E63946] rounded focus:ring-[#E9C46A]"
            />
          </div>
          <div className="flex flex-col mb-4">
            <label className="text-sm font-medium text-[#264653] mb-1">
              Phrase of the Day
            </label>
            <input
              type="checkbox"
              checked={updatedProfile?.daily_phrase || false}
              onChange={(e) => handleUpdate('daily_phrase', e.target.checked)}
              className="h-5 w-5 text-[#E9C46A] border-[#E63946] rounded focus:ring-[#E9C46A]"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 bg-[#264653] text-white py-2 px-4 rounded"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileConfig;