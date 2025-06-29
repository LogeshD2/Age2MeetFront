import React, { useState } from 'react';
import { Send, User, MessageSquare, CheckCircle, Mail, Phone } from 'lucide-react';
import './Contact.css';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        sujet: '',
        message: ''
      });
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="contact-container">
        <div className="success-message">
          <CheckCircle className="success-icon" />
          <h2 className="success-title">Message envoyé !</h2>
          <p className="success-text">Merci pour votre message. Nous vous répondrons dans les plus brefs délais.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-container">
      <div className="contact-wrapper">
        <div className="contact-header">
          <h1 className="contact-title">Contactez-nous</h1>
          <p className="contact-subtitle">
            Nous sommes là pour vous aider. N'hésitez pas à nous faire part de vos questions ou commentaires.
          </p>
        </div>

        <div className="form-container">
          <h2 className="form-title">Envoyez-nous un message</h2>
          
          <div className="form-content">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nom" className="form-label">
                  Nom complet *
                </label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`form-input ${errors.nom ? 'form-input-error' : ''}`}
                    placeholder="Votre nom complet"
                  />
                </div>
                {errors.nom && <p className="error-message">{errors.nom}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telephone" className="form-label">
                  Téléphone
                </label>
                <div className="input-wrapper">
                  <Phone className="input-icon" />
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="sujet" className="form-label">
                  Sujet
                </label>
                <select
                  id="sujet"
                  name="sujet"
                  value={formData.sujet}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="information">Demande d'information</option>
                  <option value="support">Support technique</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Message *
              </label>
              <div className="input-wrapper">
                <MessageSquare className="textarea-icon" />
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className={`form-textarea ${errors.message ? 'form-input-error' : ''}`}
                  placeholder="Écrivez votre message ici..."
                />
              </div>
              {errors.message && <p className="error-message">{errors.message}</p>}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="submit-button"
            >
              <Send className="button-icon" />
              <span>Envoyer le message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}