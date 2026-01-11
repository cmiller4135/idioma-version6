import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  BookOpen,
  Languages,
  Camera,
  Sparkles
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => (
  <Link
    to={to}
    className={`
      flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px]
      transition-colors duration-200 touch-target
      ${isActive
        ? 'text-primary-600'
        : 'text-gray-500 hover:text-gray-700 active:text-primary-600'
      }
    `}
    aria-current={isActive ? 'page' : undefined}
  >
    <span className={`
      p-1.5 rounded-xl transition-colors
      ${isActive ? 'bg-primary-100' : ''}
    `}>
      {icon}
    </span>
    <span className={`text-xs font-medium ${isActive ? 'text-primary-600' : ''}`}>
      {label}
    </span>
  </Link>
);

/**
 * MobileNav - Bottom navigation bar for mobile devices
 * Fixed to bottom, shows on screens < 1024px (lg breakpoint)
 */
const MobileNav: React.FC = () => {
  const { t } = useTranslation('navigation');
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { to: '/home', icon: <Home className="w-5 h-5" />, label: t('mobileNav.home') },
    { to: '/tools/sub2', icon: <BookOpen className="w-5 h-5" />, label: t('mobileNav.vocab') },
    { to: '/tools', icon: <Languages className="w-5 h-5" />, label: t('mobileNav.tools') },
    { to: '/teach', icon: <Camera className="w-5 h-5" />, label: t('mobileNav.media') },
    { to: '/saas2', icon: <Sparkles className="w-5 h-5" />, label: t('mobileNav.study') },
  ];

  return (
    <nav
      className="
        lg:hidden fixed bottom-0 left-0 right-0 z-40
        bg-white border-t border-gray-200 shadow-lg
        safe-area-pb
      "
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={isActive(item.to)}
          />
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
