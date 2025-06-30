import React, { useState } from 'react';
import { authService } from '../../config/api';
import './Inscription.css';

const InscriptionSection = () => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    pseudo: '',
    motDePasse: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Réinitialiser les messages d'erreur quand l'utilisateur tape
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Préparer les données pour le backend Django
      const userData = {
        username: formData.pseudo,
        email: formData.email,
        password: formData.motDePasse,
        first_name: formData.prenom,
        last_name: formData.nom,
      };

      console.log('Envoi des données à l\'API:', userData);
      
      // Appeler l'API d'inscription
      const response = await authService.register(userData);
      
      console.log('Réponse de l\'API:', response);
      
      // Si succès, sauvegarder le token et rediriger
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userId', response.user_id);
        setSuccess('Inscription réussie ! Redirection...');
        
        // Redirection après 2 secondes
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        // Réinitialiser le formulaire
        setFormData({
          prenom: '',
          nom: '',
          email: '',
          pseudo: '',
          motDePasse: ''
        });
      }
      
    } catch (error) {
      console.error('Erreur inscription:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inscription-page">
      <div className="inscription-container">
        <div className="inscription-header">
          <h1 className="inscription-title">
            Commençons l'aventure <span className="highlight">ensemble</span>
          </h1>
        </div>
        
        {/* Messages d'erreur et de succès */}
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #ffcdd2'
          }}>
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div style={{
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #c8e6c9'
          }}>
            ✅ {success}
          </div>
        )}
        
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
              disabled={loading}
              minLength="8"
            />
          </div>
          
          <button type="submit" className="btn-inscrire" disabled={loading}>
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            {!loading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InscriptionSection; 