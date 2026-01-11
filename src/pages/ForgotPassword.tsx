import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createLogger } from '../lib/errorLogger';
import { Button, Spinner } from '../components/ui';

const logger = createLogger('ForgotPassword');

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError(t('errors.requiredField'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err) {
      logger.error(err, 'resetPasswordRequest', { email });
      setError(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setSuccess(false);
    setError(null);
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md border border-error-500">
          {success ? (
            // Success State
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-success-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-primary-600">
                {t('forgotPassword.sent')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('forgotPassword.sentMessage')}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {t('forgotPassword.didNotReceive')}
              </p>
              <Button
                variant="secondary"
                onClick={handleResend}
                disabled={loading}
                className="mb-4"
              >
                {loading ? <Spinner size="sm" color="primary" /> : t('forgotPassword.resend')}
              </Button>
              <div>
                <Link
                  to="/"
                  className="text-error-500 hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('forgotPassword.backToLogin')}
                </Link>
              </div>
            </div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary-600">
                  {t('forgotPassword.title')}
                </h2>
                <p className="text-gray-600 mt-2">
                  {t('forgotPassword.subtitle')}
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
                    {t('forgotPassword.email')}
                  </label>
                  <input
                    type="email"
                    className="input border border-black"
                    placeholder={t('forgotPassword.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-accent-500 hover:bg-accent-600"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" color="white" />
                      {t('forgotPassword.sending')}
                    </span>
                  ) : (
                    t('forgotPassword.sendLink')
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="text-error-500 hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('forgotPassword.backToLogin')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
