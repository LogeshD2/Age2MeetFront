// src/components/Navbar.jsx
import React from 'react';
import './Navbar.css';

const Navbar = () => (
  <header className="navbar">
    <div className="navbar-central-container">
      <div className="navbar-logo">
        <div className="logo-icon">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#70D9FF"/>
          </svg>
        </div>
        <span className="logo-text">Age2meet</span>
      </div>
      
      <nav className="navbar-nav">
        <a href="#" className="nav-link">Accueil</a>
        <a href="#" className="nav-link">Messagerie</a>
        <a href="#" className="nav-link">Mon agenda</a>
        <a href="#" className="nav-link">Mon profil</a>
        <a href="#" className="nav-link">Contact</a>
      </nav>
      
      <button className="btn-connexion">Connexion</button>
    </div>
  </header>
);

export default Navbar;
