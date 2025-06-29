import React, { useState } from 'react';
import './Profil.css';

const ProfileSection = () => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    pseudo: '',
    motDePasse: '',
    telephone: '',
    dateNaissance: '',
    biographie: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Données du formulaire:', formData);
    // Ici vous pourriez ajouter la logique pour sauvegarder les données
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">
          Mon <span className="profile-title-accent">Profil</span>
        </h1>
        
        <div className="profile-image-container">
          <img 
            src="https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=200&h=200&fit=crop&crop=face" 
            alt="Photo de profil" 
            className="profile-image"
          />
        </div>
        
        <h2 className="profile-subtitle">Modifier mon profil</h2>
      </div>

      <div className="profile-form">
        <div className="form-group">
          <label className="form-label">
            Prénom <span className="required">*</span>
          </label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Nom <span className="required">*</span>
          </label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Pseudo <span className="required">*</span>
          </label>
          <input
            type="text"
            name="pseudo"
            value={formData.pseudo}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Mot de passe <span className="required">*</span>
          </label>
          <input
            type="password"
            name="motDePasse"
            value={formData.motDePasse}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Numéro de téléphone <span className="required">*</span>
          </label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Date de naissance <span className="required">*</span>
          </label>
          <input
            type="date"
            name="dateNaissance"
            value={formData.dateNaissance}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Biographie <span className="required">*</span>
          </label>
          <textarea
            name="biographie"
            value={formData.biographie}
            onChange={handleInputChange}
            className="form-textarea"
            rows="5"
            required
          />
        </div>

        <button type="button" onClick={handleSubmit} className="submit-button">
          Enregistrer
          <span className="button-arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSection;