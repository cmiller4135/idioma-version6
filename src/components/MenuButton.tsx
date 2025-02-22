import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface MenuButtonProps {
  onDelete: () => void;
  onRename: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onDelete, onRename }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 hover:bg-indigo-700 rounded-full transition-colors duration-200 cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4" />
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg py-1 z-10">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onRename();
              setIsOpen(false);
            }}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            Rename
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setIsOpen(false);
            }}
            className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
          >
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuButton;
