import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showHandle?: boolean;
  height?: 'auto' | 'half' | 'full';
}

/**
 * BottomSheet - Mobile-friendly modal that slides up from the bottom
 * Includes swipe-to-close gesture support
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showHandle = true,
  height = 'auto'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Touch handlers for swipe-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    // Only allow dragging down
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // If dragged more than 100px or more than 30% of sheet height, close
    const threshold = sheetRef.current
      ? Math.min(100, sheetRef.current.offsetHeight * 0.3)
      : 100;

    if (dragOffset > threshold) {
      onClose();
    }

    setDragOffset(0);
  };

  const heightClasses = {
    auto: 'max-h-[85vh]',
    half: 'h-[50vh]',
    full: 'h-[95vh]'
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black transition-opacity duration-300
          ${isOpen ? 'opacity-50' : 'opacity-0'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        className={`
          absolute bottom-0 left-0 right-0
          bg-white rounded-t-2xl shadow-xl
          transition-transform duration-300 ease-out
          ${heightClasses[height]}
          ${isOpen && dragOffset === 0 ? 'translate-y-0' : ''}
          ${!isOpen && dragOffset === 0 ? 'translate-y-full' : ''}
          overflow-hidden flex flex-col
          safe-area-pb
        `}
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        {showHandle && (
          <div
            className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            aria-hidden="true"
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2
              id="bottom-sheet-title"
              className="text-lg font-semibold text-gray-800"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors touch-target"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
