import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  [key: string]: any;
}

const TwilioOptIn = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', profile?.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, [field]: value } : null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-[#E63946]">Error: {error}</div>;
  if (!profile) return <div className="p-4">No profile found</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-[#E63946]">
      <h2 className="text-2xl font-bold mb-6 text-[#264653]">Messaging Opt In Consent</h2>
      <h3 className="text-xl mb-6 text-[#264653]">If you would like to receive Idioma-ai messages, please check one or both of the checkboxes below. </h3>
      <h3 className="text-xl mb-6 text-[#264653]">You can Opt Out of these messages at any time by unchecking the checkboxes below or  </h3>
      <h3 className="text-xl mb-6 text-[#264653]">by responding to messages by typing and sending 'STOP'.   </h3>
      <div className="space-y-4">
        {Object.entries(profile).map(([key, value]) => {
          if (key === 'id' || key === 'created_at' || key === 'updated_at' || key === 'username' || key === 'avatar_url') return null;
          const label = key === 'full_name' ? 'Name' : key.charAt(0).toUpperCase() + key.slice(1);
          return (
            <div key={key} className="flex flex-col">
              <label className="text-sm font-medium text-[#264653] mb-1">
                {label}
              </label>
              {typeof value === 'boolean' ? (
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleUpdate(key, e.target.checked)}
                  className="h-5 w-5 text-[#E9C46A] border-[#E63946] rounded focus:ring-[#E9C46A]"
                />
              ) : (
                <input
                  type="text"
                  value={value || ''}
                  onChange={(e) => handleUpdate(key, e.target.value)}
                  className="input border border-black"
                />
              )}
            </div>
          );
        })}
        <div className="border border-black p-4 rounded-lg mt-4">
          <h3 className="text-lg font-bold mb-4">Yes! I want to receive texts: I Opt-In for the following messages</h3>
          {['start_convo', 'daily_phrase'].map(key => (
            <div key={key} className="flex flex-col mb-4">
              <label className="text-sm font-medium text-[#264653] mb-1">
                {key === 'start_convo' ? 'Conversation Starters' : 'Phrase of the Day'}
              </label>
              <input
                type="checkbox"
                checked={profile[key]}
                onChange={(e) => handleUpdate(key, e.target.checked)}
                className="h-5 w-5 text-[#E9C46A] border-[#E63946] rounded focus:ring-[#E9C46A]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TwilioOptIn;
