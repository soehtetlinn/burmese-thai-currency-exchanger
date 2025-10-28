import React from 'react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-outline-secondary rounded-pill d-flex align-items-center gap-2 px-3"
      style={{ 
        borderWidth: '2px',
        transition: 'all 0.3s ease'
      }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <>
          <i className="bi bi-sun-fill text-warning" style={{ fontSize: '1.2rem' }}></i>
          <span className="d-none d-sm-inline small fw-semibold">Light</span>
        </>
      ) : (
        <>
          <i className="bi bi-moon-stars-fill text-primary" style={{ fontSize: '1.2rem' }}></i>
          <span className="d-none d-sm-inline small fw-semibold">Dark</span>
        </>
      )}
    </button>
  );
};

