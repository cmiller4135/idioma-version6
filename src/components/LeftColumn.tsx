import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb } from 'lucide-react';

const LeftColumn = () => {
  const { t } = useTranslation('common');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* <PixabayImage description="fairy tale like image of a winding road" /> */}
      <div>
      <img className="mb-1 rounded-lg shadow-md" src="/images/journey.jpg" alt="Logo" />
    </div>
      <h2 className="text-xl font-bold mb-4 text-primary-600">{t('sidebar.title')}</h2>

      <blockquote className="border-l-4 border-error-500 pl-4 mb-6 italic">
        "{t('sidebar.quote')}"
        <footer className="text-sm mt-2">- {t('sidebar.quoteAuthor')}</footer>
      </blockquote>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">{t('sidebar.toolsTitle')}</h3>
        <ul className="space-y-3">
          <li className="flex items-center">
            <Lightbulb className="h-5 w-5 text-accent-500 mr-2" />
            {t('sidebar.tool1')}
          </li>
          <li className="flex items-center">
            <Lightbulb className="h-5 w-5 text-accent-500 mr-2" />
            {t('sidebar.tool2')}
          </li>
          <li className="flex items-center">
            <Lightbulb className="h-5 w-5 text-accent-500 mr-2" />
            {t('sidebar.tool3')}
          </li>
          <li className="flex items-center">
            <Lightbulb className="h-5 w-5 text-accent-500 mr-2" />
            {t('sidebar.tool4')}
          </li>
        </ul>
      </div>

      <p className="text-sm">
        {t('sidebar.description')}
      </p>
    </div>
  );
};

export default LeftColumn;