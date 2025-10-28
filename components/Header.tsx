import React from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
  return (
    <nav className="navbar navbar-expand-lg sticky-top shadow-lg">
      <div className="container-fluid px-4 px-lg-5">
        <a className="navbar-brand d-flex align-items-center gap-3" href="/">
          <img
            src="logo.png"
            alt="CURREX Logo"
            className="rounded-circle border border-2"
            style={{ height: '50px', width: '50px', objectFit: 'contain', background: 'rgba(0,0,0,0.3)' }}
            loading="eager"
            decoding="async"
          />
          <div className="d-none d-md-block">
            <div className="fw-bold fs-4 gradient-text" style={{ letterSpacing: '2px' }}>
              CURREX
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
              <i className="bi bi-currency-exchange me-1"></i>
              MMK ✦ THB Exchange
            </div>
          </div>
        </a>
        
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-1 text-accent"></i>
        </button>
        
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav gap-2 mt-3 mt-lg-0 align-items-center">
            <li className="nav-item">
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <i className="bi bi-calculator me-2"></i>
                Calculator
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/history" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <i className="bi bi-graph-up me-2"></i>
                History
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/admin" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <i className="bi bi-gear-fill me-2"></i>
                Admin
              </NavLink>
            </li>
            <li className="nav-item ms-lg-2">
              <ThemeToggle />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};