import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const Landing = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLogin, setIsLogin] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      let authResponse;
      if (isLogin) {
        authResponse = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authResponse.error) throw authResponse.error;
        const userId = authResponse.data.user?.id;
        if (userId) {
          await supabase.rpc('increment_login_count', { user_id: userId });
          await supabase
            .from('profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userId);
        }
        navigate('/tools/sub2');
      } else {
        authResponse = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email.split('@')[0], // Store username in auth metadata
            },
          },
        });
        if (authResponse.error) throw authResponse.error;
        // Automatically log the user in after sign up
        const loginResponse = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginResponse.error) throw loginResponse.error;
        const userId = loginResponse.data.user?.id;
        if (userId) {
          await supabase.rpc('increment_login_count', { user_id: userId });
          await supabase
            .from('profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userId);
        }
        navigate('/tools/sub2');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 container-custom py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left bg-gradient-to-r from-primary-600 to-error-500 p-8 rounded-lg text-white">
          <div className="mb-4">
        <h1 className="text-4xl font-bold mb-6">{t('landing.promoTitle')}</h1>
        <Link to="/teach/sub1" className="text-2xl hover:text-custom-red underline mr-4 ">
          {t('landing.photoTranslator')}
        </Link>
        <br></br>
        <Link to="/saas2" className="text-2xl hover:text-custom-red underline">
          {t('landing.studyWithAI')}
        </Link>
        <br></br>
        <br></br>
      </div>
            <h1 className="text-3xl font-bold mb-4">{t('landing.welcomeTitle')}</h1>
            <p className="text-lg mb-3">
              {t('landing.welcomeSubtitle')}
            </p>
            <div className="space-y-4">
              <h3 className="font-semibold text-xl">{t('landing.toolsTitle')}</h3>
              <ul className="space-y-2">
                <li>• {t('landing.tool1')}</li>
                <li>• {t('landing.tool2')}</li>
                <li>• {t('landing.tool3')}</li>
                <li>• {t('landing.tool4')}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md border border-error-500">
            <h2 className="text-2xl font-bold mb-6 text-center text-primary-600">
              {isLogin ? t('login.title') : t('landing.createAccountTitle')}
            </h2>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {message && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">{message}</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-primary-600">{t('login.email')}</label>
                <input
                  type="email"
                  className="input border border-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-primary-600">{t('login.password')}</label>
                <input
                  type="password"
                  className="input border border-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn w-full bg-accent-500">
                {isLogin ? t('login.signIn') : t('signup.createAccount')}
              </button>

              {isLogin && (
                <div className="text-center mt-3">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-error-500 hover:underline"
                  >
                    {t('login.forgotPassword')}
                  </Link>
                </div>
              )}
            </form>

            {/* <div className="mt-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-2 border border-[#E63946] rounded-lg text-[#264653] hover:bg-gray-50"
              >
                <Mail className="h-5 w-5 mr-2" />
                {t('login.google')}
              </button>
            </div> */}

            <p className="mt-4 text-center text-primary-600">
              {isLogin ? t('login.noAccount') + ' ' : t('signup.alreadyHaveAccount') + ' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-error-500 hover:underline"
              >
                {isLogin ? t('login.signUp') : t('signup.signIn')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;