// src/components/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Age2meet</h3>
          <p>Des après-midis chaleureux et conviviaux pour créer des liens</p>
          
          <div className="footer-contact">
            <span>Coordonnées</span>
            <div className="contact-item"> #contact 
              📧 contact@age2meet.com
            </div>
            <div className="contact-item">
              📞 📱
            </div>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Plan du site</h4>
          <ul>
            <li><a href="/">Accueil</a></li>
            <li><a href="/messagerie">Messagerie</a></li>
            <li><a href="/agenda">Mon agenda</a></li>
            <li><a href="/profil">Mon profil</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Ressources</h4>
          <ul>
            <li><a href="/aide">Aide</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/support">Support</a></li>
            <li><a href="/tutoriels">Tutoriels</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>À propos de nous</h4>
          <ul>
            <li><a href="/qui-sommes-nous">Qui sommes-nous ?</a></li>
            <li><a href="/notre-equipe">Notre équipe</a></li>
            <li><a href="/politique">Politique de confidentialité</a></li>
            <li><a href="/conditions">Conditions d'utilisation</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Mentions RGPD</h4>
          <p>Conformément au RGPD, vos données personnelles sont protégées. Consultez notre politique de confidentialité pour plus d'informations sur le traitement de vos données.</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>2025 Age2meet. Tous droits réservés. Mentions légales.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
