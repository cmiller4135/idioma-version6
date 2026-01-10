import React from 'react';

export interface SkipLinkProps {
  targetId: string;
  children?: React.ReactNode;
}

/**
 * SkipLink component for keyboard navigation accessibility.
 * Allows keyboard users to skip directly to main content.
 * Hidden by default, visible on focus.
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  children = 'Skip to main content'
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="
        sr-only focus:not-sr-only
        focus:absolute focus:top-4 focus:left-4 focus:z-[100]
        focus:px-4 focus:py-2
        focus:bg-primary-600 focus:text-white
        focus:rounded-lg focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-white
        transition-all duration-200
      "
    >
      {children}
    </a>
  );
};

export default SkipLink;
