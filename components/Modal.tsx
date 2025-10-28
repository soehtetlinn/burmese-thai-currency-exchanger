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
    <>
      <div 
        className="modal-backdrop show" 
        style={{ backdropFilter: 'blur(8px)', background: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />
      <div className="modal show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            {title && (
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-accent">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {title}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={onClose}
                  aria-label="Close"
                />
              </div>
            )}
            <div className="modal-body">
              {children}
            </div>
            <div className="modal-footer border-0">
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={onClose}
              >
                <i className="bi bi-check-lg me-2"></i>
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


