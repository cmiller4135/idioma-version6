import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  country_code?: string;
  phone_num?: string;
  start_convo?: boolean;
  daily_phrase?: boolean;
}

const ProfileConfig = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedProfile, setUpdatedProfile] = useState<Profile | null>(null);
  const [phoneError, setPhoneError] = useState<boolean>(false);

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const handleUpdate = (field: string, value: any) => {
    if (field === 'phone_num' && /\D/.test(value)) {
      setPhoneError(true);
    } else {
      setPhoneError(false);
    }
    setUpdatedProfile(prev => prev ? { ...prev, [field]: value } : null);
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
        <div className="flex flex-col">
          <label className="text-sm font-medium text-[#264653] mb-1">
            Country Code
          </label>
          <input
            type="text"
            value={updatedProfile?.country_code || ''}
            onChange={(e) => handleUpdate('country_code', e.target.value)}
            className="input border border-black"
          />
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