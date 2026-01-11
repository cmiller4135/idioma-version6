import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

// Parent route mapping for building hierarchy
const parentRoutes: Record<string, string> = {
  '/tools/sub1': '/tools',
  '/tools/sub2': '/tools',
  '/tools/sub3': '/tools',
  '/teach/sub1': '/teach',
  '/teach/sub2': '/teach',
};

export const Breadcrumb: React.FC = () => {
  const { t } = useTranslation('navigation');
  const location = useLocation();
  const currentPath = location.pathname;

  // Route to breadcrumb mapping using translations
  const getRouteLabel = (path: string): string => {
    const labels: Record<string, string> = {
      '/home': t('breadcrumbs.home'),
      '/tools': t('breadcrumbLabels.learningTools'),
      '/tools/sub1': t('toolsDropdown.verbConjugator'),
      '/tools/sub2': t('breadcrumbLabels.myVocabulary'),
      '/tools/sub3': t('toolsDropdown.topicVocabulary'),
      '/teach': t('breadcrumbLabels.multimediaLearning'),
      '/teach/sub1': t('teachDropdown.photoTranslation'),
      '/teach/sub2': t('teachDropdown.audioTranslation'),
      '/saas1': t('breadcrumbLabels.spanishPractice'),
      '/saas2': t('breadcrumbLabels.aiLanguageStudy'),
      '/profile/config': t('breadcrumbs.settings'),
    };
    return labels[path] || path;
  };

  // Don't show breadcrumbs on home or landing
  if (currentPath === '/' || currentPath === '/home') {
    return null;
  }

  // Build breadcrumb trail
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: t('breadcrumbs.home'), path: '/home' }
    ];

    // Check if current path has a parent
    const parent = parentRoutes[currentPath];
    if (parent) {
      breadcrumbs.push({
        label: getRouteLabel(parent),
        path: parent
      });
    }

    // Add current page
    const currentLabel = getRouteLabel(currentPath);
    if (currentLabel !== currentPath) {
      breadcrumbs.push({
        label: currentLabel,
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
