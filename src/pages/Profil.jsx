import React, { useState } from 'react';
import './Profil.css';

const Profil = () => {
  const [profileData, setProfileData] = useState({
    nom: '',
    description: ''
  });

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Données du profil:', profileData);
  };

  return (
    <div className="profil-page">
      <div className="profil-header">
        <h1 className="profil-title">Profil</h1>
      </div>
      
      <div className="profil-container">
        <div className="profil-avatar">
          <div className="avatar-circle">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        <form className="profil-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={profileData.nom}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={profileData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>
          
          <button type="submit" className="btn-enregistrer">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profil; 