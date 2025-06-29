import React, { useState } from 'react';
import './Login.css';

const LoginSection = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Connexion avec:', { email, password });
  };

  const handleSignup = () => {
    console.log('Redirection vers inscription');
  };

  return (
    <div className="lp-container">
      <div className="lp-card">
        <h1 className="lp-title">
          Se connecter à mon <span className="lp-highlight">espace</span>
        </h1>
        
        <form onSubmit={handleSubmit} className="lp-form">
          <div className="lp-form-group">
            <label htmlFor="email" className="lp-form-label">
              Email (ou Pseudo) <span className="lp-required">*</span>
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="lp-form-input"
              required
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
            />
          </div>
        </form>

        <div className="lp-buttons-container">
          <button type="submit" onClick={handleSubmit} className="lp-btn-primary">
            Connexion
            <span className="lp-btn-arrow">›</span>
          </button>

          <button onClick={handleSignup} className="lp-btn-secondary">
            Toujours pas inscrit ?
            <span className="lp-btn-arrow">›</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSection;