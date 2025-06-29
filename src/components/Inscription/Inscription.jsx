import React, { useState } from 'react';
import './Inscription.css';

const InscriptionSection = () => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    pseudo: '',
    motDePasse: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Données du formulaire:', formData);
  };

  return (
    <div className="inscription-page">
      <div className="inscription-container">
        <div className="inscription-header">
          <h1 className="inscription-title">
            Commençons l'aventure <span className="highlight">ensemble</span>
          </h1>
        </div>
        
        <form className="inscription-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prenom">Prénom*</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="nom">Nom*</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email*</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="pseudo">Pseudo*</label>
              <input
                type="text"
                id="pseudo"
                name="pseudo"
                value={formData.pseudo}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="motDePasse">Mot de passe*</label>
            <input
              type="password"
              id="motDePasse"
              name="motDePasse"
              value={formData.motDePasse}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="btn-inscrire">
            S'inscrire
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default InscriptionSection; 