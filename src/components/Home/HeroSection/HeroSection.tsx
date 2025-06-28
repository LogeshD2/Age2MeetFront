import React from 'react';
import './HeroSection.css'; // Si tu veux ajouter du style

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <h1 className="hero-title">Bienvenue sur Age2Meet</h1>
        <p className="hero-subtitle">
          Connectez-vous avec des personnes qui partagent vos passions.
        </p>
        <button className="hero-button">Commencer maintenant</button>
      </div>
    </section>
  );
};

export default HeroSection;
