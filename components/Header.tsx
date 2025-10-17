import React from 'react';
import { NavLink } from 'react-router-dom';

const navLinkClasses = "px-4 py-2 rounded-full text-base font-medium transition-all duration-300";
const activeLinkClasses = "bg-brand-accent text-slate-900 shadow-lg";
const inactiveLinkClasses = "text-brand-text-secondary hover:bg-brand-primary hover:text-brand-text";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-brand-surface backdrop-blur-lg border-b border-brand-border">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <img
              src="logo.png"
              alt="CURREX Logo"
              className="h-12 w-12 rounded-full border border-brand-border object-contain bg-black/30"
              loading="eager"
              decoding="async"
            />
            <div className="leading-tight hidden md:block">
              <div className="font-extrabold text-2xl tracking-wider">CURREX</div>
              <div className="text-xs text-brand-text-secondary">MMK ✦ THB Exchange</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <NavLink 
              to="/" 
              className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
            >
              Calculator
            </NavLink>
            <NavLink 
              to="/history" 
              className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
            >
              History
            </NavLink>
            <NavLink 
              to="/admin" 
              className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
            >
              Admin
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
};