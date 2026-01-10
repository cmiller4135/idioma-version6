import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

// Route to breadcrumb mapping
const routeLabels: Record<string, string> = {
  '/home': 'Home',
  '/tools': 'Learning Tools',
  '/tools/sub1': 'Verb Conjugator',
  '/tools/sub2': 'My Vocabulary',
  '/tools/sub3': 'Topic Vocabulary',
  '/teach': 'Multimedia Learning',
  '/teach/sub1': 'Photo Translation',
  '/teach/sub2': 'Audio Translation',
  '/saas1': 'Spanish Practice',
  '/saas2': 'AI Language Study',
  '/profile/config': 'Settings',
};

// Parent route mapping for building hierarchy
const parentRoutes: Record<string, string> = {
  '/tools/sub1': '/tools',
  '/tools/sub2': '/tools',
  '/tools/sub3': '/tools',
  '/teach/sub1': '/teach',
  '/teach/sub2': '/teach',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Don't show breadcrumbs on home or landing
  if (currentPath === '/' || currentPath === '/home') {
    return null;
  }

  // Build breadcrumb trail
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/home' }
    ];

    // Check if current path has a parent
    const parent = parentRoutes[currentPath];
    if (parent && routeLabels[parent]) {
      breadcrumbs.push({
        label: routeLabels[parent],
        path: parent
      });
    }

    // Add current page
    if (routeLabels[currentPath]) {
      breadcrumbs.push({
        label: routeLabels[currentPath],
        path: currentPath
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400" aria-hidden="true" />
              )}
              {isLast ? (
                <span className="font-medium text-primary-600" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {isFirst && <Home className="w-4 h-4" />}
                  <span>{!isFirst && item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
