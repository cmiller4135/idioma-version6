import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
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
        navigate('/home');
      } else {
        authResponse = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email.split('@')[0], // Store username in auth metadata
            },
            emailRedirectTo: `${window.location.origin}/verify-email`
          },
        });
        if (authResponse.error) throw authResponse.error;
        setMessage('A verification email has been sent to your email address. Please verify your email before logging in.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 container-custom py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left bg-gradient-to-r from-[#264653] to-[#E63946] p-8 rounded-lg text-white">
          <div className="mb-4">
        <h1 className="text-4xl font-bold mb-6">For a limited time, try these learning tools for free!</h1>
        <Link to="/teach/sub1" className="text-2xl hover:text-custom-red underline mr-4 ">
          Photo Translator
        </Link>
        <br></br>
        <Link to="/saas2" className="text-2xl hover:text-custom-red underline">
          Study a Language with AI
        </Link>
        <br></br>
        <br></br>
      </div>
            <h1 className="text-3xl font-bold mb-4">Welcome to Idioma-AI</h1>
            <p className="text-lg mb-3">
              Transform your language learning journey with AI-powered tools and personalized lessons.
            </p>
            <div className="space-y-4">
              <h3 className="font-semibold text-xl">Cool Tools You'll Love:</h3>
              <ul className="space-y-2">
                <li>• AI-Powered Image/Photo Translation</li>
                <li>• Learn a Language with topics you love</li>
                <li>• Fun conjugation learning tools</li>
                <li>• Improve your vocabulary with AI</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md border border-[#E63946]">
            <h2 className="text-2xl font-bold mb-6 text-center text-[#264653]">
              {isLogin ? 'Welcome Back!' : 'Create Your Account to Get More Language Learning Tools'}
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
                <label className="block text-sm font-medium mb-2 text-[#264653]">Email</label>
                <input
                  type="email"
                  className="input border border-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#264653]">Password</label>
                <input
                  type="password"
                  className="input border border-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn w-full bg-[#E9C46A]">
                {isLogin ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            {/* <div className="mt-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-2 border border-[#E63946] rounded-lg text-[#264653] hover:bg-gray-50"
              >
                <Mail className="h-5 w-5 mr-2" />
                Continue with Google
              </button>
            </div> */}

            <p className="mt-4 text-center text-[#264653]">
              {isLogin ? "Don't have an account? " : "Already a member? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#E63946] hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;