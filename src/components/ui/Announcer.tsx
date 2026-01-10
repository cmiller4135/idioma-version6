import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';

type AnnouncementPoliteness = 'polite' | 'assertive';

interface Announcement {
  message: string;
  politeness: AnnouncementPoliteness;
  id: number;
}

interface AnnouncerContextValue {
  announce: (message: string, politeness?: AnnouncementPoliteness) => void;
}

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

let announcementId = 0;

/**
 * AnnouncerProvider wraps the app to provide screen reader announcements.
 * Uses aria-live regions to announce dynamic content changes.
 */
export const AnnouncerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [politeAnnouncement, setPoliteAnnouncement] = useState<Announcement | null>(null);
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState<Announcement | null>(null);

  const announce = useCallback((message: string, politeness: AnnouncementPoliteness = 'polite') => {
    const announcement: Announcement = {
      message,
      politeness,
      id: ++announcementId
    };

    if (politeness === 'assertive') {
      setAssertiveAnnouncement(announcement);
    } else {
      setPoliteAnnouncement(announcement);
    }

    // Clear after announcement
    setTimeout(() => {
      if (politeness === 'assertive') {
        setAssertiveAnnouncement(null);
      } else {
        setPoliteAnnouncement(null);
      }
    }, 1000);
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}

      {/* Polite announcements (non-interruptive) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeAnnouncement?.message}
      </div>

      {/* Assertive announcements (interruptive, for errors/urgency) */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveAnnouncement?.message}
      </div>
    </AnnouncerContext.Provider>
  );
};

/**
 * Hook to announce messages to screen readers.
 * @example
 * const { announce } = useAnnouncer();
 * announce('Item added to cart');
 * announce('Error: Invalid input', 'assertive');
 */
export const useAnnouncer = (): AnnouncerContextValue => {
  const context = useContext(AnnouncerContext);
  if (!context) {
    // Return a no-op if used outside provider
    return { announce: () => {} };
  }
  return context;
};

/**
 * LiveRegion component for announcing dynamic content changes.
 * Wrap content that changes dynamically to announce updates.
 */
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  politeness?: AnnouncementPoliteness;
  atomic?: boolean;
  className?: string;
}> = ({
  children,
  politeness = 'polite',
  atomic = true,
  className = ''
}) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={className}
    >
      {children}
    </div>
  );
};

export default AnnouncerProvider;
