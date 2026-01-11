import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  ChevronDown,
  BookOpen,
  Languages,
  Camera,
  Mic,
  User,
  Settings,
  LogOut,
  Home,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LanguageSelector } from './LanguageSelector';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, onClick, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
        ${isActive
          ? 'bg-primary-700 text-accent-400 font-medium'
          : 'text-accent-300 hover:bg-primary-700 hover:text-accent-400'
        }
      `}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </Link>
  );
};

interface DropdownItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
}

interface NavDropdownProps {
  label: string;
  icon: React.ReactNode;
  items: DropdownItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const NavDropdown: React.FC<NavDropdownProps> = ({
  label,
  icon,
  items,
  isOpen,
  onToggle,
  onClose
}) => {
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isActive = items.some(item =>
    location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
          ${isActive
            ? 'bg-primary-700 text-accent-400 font-medium'
            : 'text-accent-300 hover:bg-primary-700 hover:text-accent-400'
          }
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {icon}
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`
                flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors
                ${location.pathname === item.path ? 'bg-primary-50' : ''}
              `}
            >
              <span className="text-primary-500 mt-0.5">{item.icon}</span>
              <div>
                <div className="font-medium text-gray-800">{item.label}</div>
                {item.description && (
                  <div className="text-sm text-gray-500">{item.description}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar: React.FC = () => {
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open and add escape key handler
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';

      // Handle escape key to close menu
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  const toolsItems: DropdownItem[] = [
    {
      label: t('toolsDropdown.verbConjugator'),
      path: '/tools/sub1',
      icon: <Languages className="w-5 h-5" />,
      description: t('toolsDropdown.verbConjugatorDesc')
    },
    {
      label: t('toolsDropdown.topicVocabulary'),
      path: '/tools/sub3',
      icon: <BookOpen className="w-5 h-5" />,
      description: t('toolsDropdown.topicVocabularyDesc')
    },
  ];

  const multimediaItems: DropdownItem[] = [
    {
      label: t('teachDropdown.photoTranslation'),
      path: '/teach/sub1',
      icon: <Camera className="w-5 h-5" />,
      description: t('teachDropdown.photoTranslationDesc')
    },
    {
      label: t('teachDropdown.audioTranslation'),
      path: '/teach/sub2',
      icon: <Mic className="w-5 h-5" />,
      description: t('teachDropdown.audioTranslationDesc')
    },
  ];

  const profileItems: DropdownItem[] = [
    {
      label: t('navbar.settings'),
      path: '/profile/config',
      icon: <Settings className="w-5 h-5" />,
      description: t('toolsDropdown.vocabularyManagerDesc')
    },
  ];

  return (
    <nav
      className="bg-primary-600 shadow-lg sticky top-0 z-40"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/home"
            className="flex items-center gap-2 text-xl font-bold text-accent-400 hover:text-accent-300 transition-colors"
            aria-label="Idioma-AI - Go to home page"
          >
            <GraduationCap className="w-7 h-7" aria-hidden="true" />
            <span>Idioma-AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink to="/home" icon={<Home className="w-4 h-4" />}>
              {t('navbar.home')}
            </NavLink>

            <NavLink to="/tools/sub2" icon={<BookOpen className="w-4 h-4" />}>
              {t('navbar.myVocabulary')}
            </NavLink>

            <NavDropdown
              label={t('navbar.learningTools')}
              icon={<Languages className="w-4 h-4" />}
              items={toolsItems}
              isOpen={activeDropdown === 'tools'}
              onToggle={() => toggleDropdown('tools')}
              onClose={closeDropdowns}
            />

            <NavDropdown
              label={t('navbar.multimedia')}
              icon={<Camera className="w-4 h-4" />}
              items={multimediaItems}
              isOpen={activeDropdown === 'multimedia'}
              onToggle={() => toggleDropdown('multimedia')}
              onClose={closeDropdowns}
            />

            <NavLink to="/saas2" icon={<Sparkles className="w-4 h-4" />}>
              {t('navbar.aiStudy')}
            </NavLink>
          </div>

          {/* Desktop Right Section - Language & Profile */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Profile Dropdown */}
            <NavDropdown
              label={t('navbar.profile')}
              icon={<User className="w-4 h-4" />}
              items={profileItems}
              isOpen={activeDropdown === 'profile'}
              onToggle={() => toggleDropdown('profile')}
              onClose={closeDropdowns}
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-accent-400 hover:bg-primary-700 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t('navbar.closeMenu') : t('navbar.openMenu')}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`
          lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-primary-600 z-50
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-500">
          <span className="text-lg font-semibold text-accent-400">{t('navbar.menu')}</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-accent-400 hover:bg-primary-700 transition-colors"
            aria-label={t('navbar.closeMenu')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
          <NavLink to="/home" icon={<Home className="w-5 h-5" />}>
            {t('navbar.home')}
          </NavLink>

          <NavLink to="/tools/sub2" icon={<BookOpen className="w-5 h-5" />}>
            {t('navbar.myVocabulary')}
          </NavLink>

          {/* Tools Section */}
          <div className="pt-4">
            <div className="text-xs font-semibold text-accent-500/60 uppercase tracking-wider px-3 mb-2">
              {t('navbar.learningTools')}
            </div>
            <NavLink to="/tools/sub1" icon={<Languages className="w-5 h-5" />}>
              {t('toolsDropdown.verbConjugator')}
            </NavLink>
            <NavLink to="/tools/sub3" icon={<BookOpen className="w-5 h-5" />}>
              {t('toolsDropdown.topicVocabulary')}
            </NavLink>
          </div>

          {/* Multimedia Section */}
          <div className="pt-4">
            <div className="text-xs font-semibold text-accent-500/60 uppercase tracking-wider px-3 mb-2">
              {t('navbar.multimediaLearning')}
            </div>
            <NavLink to="/teach/sub1" icon={<Camera className="w-5 h-5" />}>
              {t('teachDropdown.photoTranslation')}
            </NavLink>
            <NavLink to="/teach/sub2" icon={<Mic className="w-5 h-5" />}>
              {t('teachDropdown.audioTranslation')}
            </NavLink>
          </div>

          {/* AI Study */}
          <div className="pt-4">
            <NavLink to="/saas2" icon={<Sparkles className="w-5 h-5" />}>
              {t('navbar.aiLanguageStudy')}
            </NavLink>
          </div>

          {/* Language Selection */}
          <div className="pt-4 border-t border-primary-500 mt-4">
            <div className="text-xs font-semibold text-accent-500/60 uppercase tracking-wider px-3 mb-2">
              {t('navbar.language')}
            </div>
            <div className="px-3 py-2">
              <LanguageSelector />
            </div>
          </div>

          {/* Profile Section */}
          <div className="pt-4 border-t border-primary-500 mt-4">
            <div className="text-xs font-semibold text-accent-500/60 uppercase tracking-wider px-3 mb-2">
              {t('navbar.account')}
            </div>
            <NavLink to="/profile/config" icon={<Settings className="w-5 h-5" />}>
              {t('navbar.settings')}
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-accent-300 hover:bg-primary-700 hover:text-accent-400 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              {t('navbar.signOut')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
