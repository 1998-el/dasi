import React, { useEffect, useRef, useState } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentName: string;
}

export const useDeleteConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);

  const showConfirmation = (id: string, name: string) => {
    setStudentToDelete({ id, name });
    setIsOpen(true);
  };

  const hideConfirmation = () => {
    setIsOpen(false);
    setStudentToDelete(null);
  };

  return {
    isOpen,
    studentToDelete,
    showConfirmation,
    hideConfirmation,
  };
};

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  studentName,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div 
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden animate-modalAppear"
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full">
            <div className="relative">
              <TrashIcon className="w-8 h-8 text-red-500" />
              <div className="absolute inset-0 w-8 h-8 bg-red-500 rounded-full animate-ping opacity-25" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Supprimer l'Ã©tudiant ?
          </h3>
          
          <p className="text-sm text-gray-500 text-center mb-6">
            ÃŠtes-vous sÃ»r de vouloir supprimer <span className="font-medium text-gray-700">{studentName}</span> ? 
            Cette action est irrÃ©versible.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-[0.98]"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all duration-200 active:scale-[0.98]"
            >
              Supprimer
            </button>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <style>{`
        @keyframes modalAppear {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        .animate-modalAppear {
          animation: modalAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};


