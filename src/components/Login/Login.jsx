import React, { useState } from 'react';
import { authService } from '../../config/api';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const LoginSection = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Tentative de connexion avec:', { email });
      
      // Appeler l'API de connexion
      const response = await authService.login(email, password);
      
      console.log('Réponse de connexion:', response);
      
      // Si succès, sauvegarder le token et rediriger
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userId', response.user_id);
        localStorage.setItem('username', response.username);
        
        console.log('Connexion réussie, redirection...');
        // Déclencher un événement de changement pour la navbar
        window.dispatchEvent(new Event('storage'));
        
        setSuccess('Connexion réussie ! Redirection...');
        
        // Rediriger après un court délai
        setTimeout(() => {
          navigate('/profil');
        }, 1000);
      }
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    window.location.href = '/inscription';
  };

  return (
    <div className="lp-container">
      <div className="lp-card">
        <h1 className="lp-title">
          Se connecter à mon <span className="lp-highlight">espace</span>
        </h1>
        
        {/* Message d'erreur */}
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
        
        <form onSubmit={handleSubmit} className="lp-form">
          <div className="lp-form-group">
            <label htmlFor="email" className="lp-form-label">
              Email <span className="lp-required">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="lp-form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="lp-form-group">
            <label htmlFor="password" className="lp-form-label">
              Mot de passe <span className="lp-required">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="lp-form-input"
              required
              disabled={loading}
            />
          </div>
        </form>

        <div className="lp-buttons-container">
          <button type="submit" onClick={handleSubmit} className="lp-btn-primary" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Connexion'}
            {!loading && <span className="lp-btn-arrow">›</span>}
          </button>

          <button onClick={handleSignup} className="lp-btn-secondary" disabled={loading}>
            Toujours pas inscrit ?
            <span className="lp-btn-arrow">›</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSection;