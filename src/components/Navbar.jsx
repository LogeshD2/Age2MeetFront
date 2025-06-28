// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#70D9FF"/>
            </svg>
          </div>
          <Link to="/" className="logo-text">Age2meet</Link>
        </div>

        {/* Navigation Links */}
        <nav className="navbar-nav">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/messagerie" className="nav-link">Messagerie</Link>
          <Link to="/agenda" className="nav-link">Mon agenda</Link>
          <Link to="/profil" className="nav-link">Mon profil</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>

        {/* Connection Button */}
        <div className="navbar-actions">
          <Link to="/connexion" className="btn-connexion">Connexion</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
