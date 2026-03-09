import React, { useEffect, useRef } from 'react';

interface IScreenReaderAnnouncerProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearAfter?: number; // milliseconds
}

/**
 * Screen reader announcer component using aria-live regions
 * Announces messages to screen readers without visual display
 */
export const ScreenReaderAnnouncer: React.FC<IScreenReaderAnnouncerProps> = ({
  message,
  politeness = 'polite',
  clearAfter = 3000,
}) => {
  const [currentMessage, setCurrentMessage] = React.useState(message);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);

      // Clear message after specified time
      if (clearAfter > 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setCurrentMessage('');
        }, clearAfter);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {currentMessage}
    </div>
  );
};

/**
 * Hook to manage screen reader announcements
 */
export const useScreenReaderAnnouncer = () => {
  const [announcement, setAnnouncement] = React.useState('');
  const [politeness, setPoliteness] = React.useState<'polite' | 'assertive'>('polite');

  const announce = (message: string, level: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(level);
    setAnnouncement(message);
  };

  return {
    announcement,
    politeness,
    announce,
  };
};
