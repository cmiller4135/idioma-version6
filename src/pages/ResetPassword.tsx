import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createLogger } from '../lib/errorLogger';
import { Button, Spinner } from '../components/ui';

const logger = createLogger('ResetPassword');

const ResetPassword: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();
  }, []);

  const validatePassword = (): boolean => {
    if (!password.trim()) {
      setError(t('errors.requiredField'));
      return false;
    }

    if (password.length < 8) {
      setError(t('resetPassword.passwordTooShort'));
      return false;
    }

    if (password !== confirmPassword) {
      setError(t('resetPassword.passwordMismatch'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      logger.info('Password reset successful');

      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      logger.error(err, 'updatePassword');
      setError(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  // Invalid session state
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-error-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-primary-600">
                {t('resetPassword.invalidLink')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('resetPassword.invalidLinkMessage')}
              </p>
              <Link
                to="/forgot-password"
                className="text-accent-500 hover:underline inline-flex items-center gap-1"
              >
                {t('resetPassword.requestNewLink')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          {success ? (
            // Success State
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-success-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-primary-600">
                {t('resetPassword.success')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('resetPassword.successMessage')}
              </p>
              <p className="text-sm text-gray-500">
                {t('resetPassword.redirecting')}
              </p>
            </div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-600">
                  {t('resetPassword.title')}
                </h2>
                <p className="text-gray-600 mt-2">
                  {t('resetPassword.subtitle')}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-primary-600">
                    {t('resetPassword.newPassword')}
                  </label>
                  <input
                    type="password"
                    className="input border border-black"
                    placeholder={t('resetPassword.newPasswordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-primary-600">
                    {t('resetPassword.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    className="input border border-black"
                    placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={8}
                  />
                </div>

                <p className="text-xs text-gray-500">
                  {t('resetPassword.passwordRequirements')}
                </p>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-accent-500 hover:bg-accent-600"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" color="white" />
                      {t('resetPassword.updating')}
                    </span>
                  ) : (
                    t('resetPassword.updatePassword')
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="text-error-500 hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('resetPassword.backToLogin')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
