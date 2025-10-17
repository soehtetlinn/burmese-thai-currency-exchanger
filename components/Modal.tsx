import React from 'react';

interface ModalProps {
  title?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  confirmText?: string;
}

export const Modal: React.FC<ModalProps> = ({ title, children, isOpen, onClose, confirmText = 'OK' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-2xl w-[90%] max-w-md p-6">
        {title && <h3 className="text-xl font-semibold text-brand-accent mb-3">{title}</h3>}
        <div className="text-brand-text mb-6">{children}</div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-brand-accent text-slate-900 font-semibold hover:bg-brand-accent-hover transition">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};


