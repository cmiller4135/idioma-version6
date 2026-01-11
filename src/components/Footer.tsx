import React from 'react';
import { useTranslation } from 'react-i18next';
import { Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation('navigation');

  return (
    <footer className="bg-gray-50 shadow-md mt-auto">
      <div className="container-custom py-8 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-primary-600 mb-4 md:mb-0">
            © {new Date().getFullYear()} idioma-ai. {t('footer.copyright')}
          </div>
          <div className="flex space-x-6">
            <a
              href="https://twitter.com/idioma_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-error-500"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="https://instagram.com/idioma.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-error-500"
            >
              <Instagram className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;