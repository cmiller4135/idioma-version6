import React from 'react';
import { Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 shadow-md mt-auto">
      <div className="container-custom py-8 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-[#264653] mb-4 md:mb-0">
            © 2024 idioma-ai. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a
              href="https://twitter.com/idioma_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#264653] hover:text-[#E63946]"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="https://instagram.com/idioma.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#264653] hover:text-[#E63946]"
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