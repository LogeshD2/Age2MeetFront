// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, contactService, messageService, profileService } from '../config/api';
import './Navbar.css';
import logoImage from '../assets/images/Age2MeetLogo.png';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const navigate = useNavigate();

  // Fonction pour compter les messages non lus
  const loadUnreadMessagesCount = async () => {
    if (!isLoggedIn) {
      setUnreadMessagesCount(0);
      return;
    }

    try {
      // D'abord récupérer l'ID de l'utilisateur actuel
      const profileData = await profileService.getProfile();
      const currentUserId = profileData.user?.id;
      
      if (!currentUserId) {
        setUnreadMessagesCount(0);
        return;
      }

      const contactsData = await contactService.getMyContacts();
      let totalUnread = 0;

      for (const contact of contactsData.accepted_contacts || []) {
        try {
          const messagesData = await messageService.getMessages(contact.id);
          // Compter les messages non lus reçus par l'utilisateur actuel
          const unreadFromContact = messagesData.filter(msg => 
            msg.receiver.id === currentUserId && !msg.is_read
          ).length;
          totalUnread += unreadFromContact;
        } catch (error) {
          // Ignorer les erreurs pour un contact spécifique
          console.error(`Erreur messages pour contact ${contact.id}:`, error);
        }
      }

      setUnreadMessagesCount(totalUnread);
    } catch (error) {
      console.error('Erreur lors du comptage des messages non lus:', error);
      setUnreadMessagesCount(0);
    }
  };

  // Vérifier l'état de connexion au montage du composant
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      const wasLoggedIn = isLoggedIn;
      const nowLoggedIn = !!token;
      
      setIsLoggedIn(nowLoggedIn);
      
      // Si on vient de se connecter, charger les messages non lus
      if (!wasLoggedIn && nowLoggedIn) {
        loadUnreadMessagesCount();
      }
    };

    checkLoginStatus();
    
    // Écouter les changements dans le localStorage pour des mises à jour en temps réel
    const handleStorageChange = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier également les changements depuis d'autres composants
    const checkInterval = setInterval(checkLoginStatus, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [isLoggedIn]);

  // Mettre à jour le compteur de messages non lus régulièrement
  useEffect(() => {
    if (isLoggedIn) {
      loadUnreadMessagesCount();
      
      // Mettre à jour toutes les 30 secondes
      const unreadInterval = setInterval(loadUnreadMessagesCount, 30000);
      
      // Écouter les événements de mise à jour depuis la messagerie
      const handleMessagesUpdate = () => {
        loadUnreadMessagesCount();
      };
      
      window.addEventListener('messagesUpdated', handleMessagesUpdate);
      
      return () => {
        clearInterval(unreadInterval);
        window.removeEventListener('messagesUpdated', handleMessagesUpdate);
      };
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      console.log('Déconnexion en cours...');
      await authService.logout();
      
      // Supprimer le token du localStorage
      localStorage.removeItem('authToken');
      
      // Mettre à jour l'état
      setIsLoggedIn(false);
      
      // Rediriger vers la page de connexion
      navigate('/login');
      
      console.log('Déconnexion réussie');
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, on supprime le token local
      localStorage.removeItem('authToken');
      setIsLoggedIn(false);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-central-container">
        <div className="navbar-logo">
          <img src={logoImage} alt="Age2meet" className="logo-image" />
        </div>
        
        <nav className="navbar-nav">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/messagerie" className="nav-link messagerie-link">
            Messagerie
            {isLoggedIn && unreadMessagesCount > 0 && (
              <span className="navbar-unread-badge">
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </span>
            )}
          </Link>
          <Link to="/agenda" className="nav-link">Mon agenda</Link>
          <Link to="/profil" className="nav-link">Mon profil</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>
        
        {isLoggedIn ? (
          <button 
            onClick={handleLogout} 
            className="btn-connexion btn-deconnexion"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
          </button>
        ) : (
          <Link to="/login" className="btn-connexion">Connexion</Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
