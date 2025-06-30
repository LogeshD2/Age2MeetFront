import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactService, userService } from '../../config/api';
import './Contact.css';

export default function ContactSection() {
  const [activeTab, setActiveTab] = useState('contact');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États pour les vraies données
  const [contacts, setContacts] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  const navigate = useNavigate();

  // Helper function pour rendre les avatars correctement
  const renderAvatar = (profilePicture, name, className = "contact-avatar-large") => {
    const isImageUrl = profilePicture && (profilePicture.includes('http') || profilePicture.includes('/media/'));
    const imageUrl = isImageUrl ? 
      (profilePicture.startsWith('/media/') ? `http://localhost:8000${profilePicture}` : profilePicture) : 
      null;
    
    if (isImageUrl) {
      return (
        <div className={className}>
          <img 
            src={imageUrl} 
            alt={name}
            className="avatar-image"
            onError={(e) => {
              console.log('Image failed to load:', profilePicture);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <span 
            className="avatar-letter" 
            style={{display: 'none'}}
          >
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      );
    } else {
      return (
        <div className={className}>
          <span className="avatar-letter">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      );
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadContactData();
  }, []);

  const loadContactData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Récupérer mes contacts depuis l'API
      const contactsData = await contactService.getMyContacts();
      console.log('Contacts récupérés:', contactsData);
      
      // Séparer les contacts acceptés et les demandes en attente
      const acceptedContacts = contactsData.accepted_contacts || [];
      const pendingContactRequests = contactsData.pending_requests || [];
      
      // Formater les contacts acceptés
      const formattedContacts = acceptedContacts.map(contact => ({
        id: contact.id,
        name: contact.username || `${contact.first_name} ${contact.last_name}`,
        fullName: `${contact.first_name} ${contact.last_name}`,
        email: contact.email,
        bio: contact.bio || 'Aucune description disponible',
        location: contact.location || 'Non spécifié',
        interests: contact.interests ? contact.interests.split(',').map(i => i.trim()) : [],
        status: contact.status || 'online',
        profilePicture: contact.profile_picture,
        contactRelationId: contact.contact_relation_id
      }));
      
      // Formater les demandes en attente
      const formattedRequests = pendingContactRequests.map(request => ({
        id: request.user.id,
        name: request.user.username || `${request.user.first_name} ${request.user.last_name}`,
        fullName: `${request.user.first_name} ${request.user.last_name}`,
        email: request.user.email,
        bio: request.user.bio || 'Aucune description disponible',
        location: request.user.location || 'Non spécifié',
        interests: request.user.interests ? request.user.interests.split(',').map(i => i.trim()) : [],
        status: 'pending',
        profilePicture: request.user.profile_picture,
        contactRelationId: request.id
      }));
      
      setContacts(formattedContacts);
      setPendingRequests(formattedRequests);
      
      // Récupérer les utilisateurs suggérés
      const homeData = await userService.getAllUsers();
      console.log('Données accueil:', homeData);
      
      if (homeData.suggested_contacts) {
        const suggestedUsers = homeData.suggested_contacts.map(user => ({
          id: user.id,
          name: user.username || `${user.first_name} ${user.last_name}`,
          fullName: `${user.first_name} ${user.last_name}`,
          email: user.username,
          bio: user.bio || 'Aucune description disponible',
          location: user.location || 'Non spécifié',
          interests: user.interests ? user.interests.split(',').map(i => i.trim()) : [],
          profile_picture: user.profile_picture
        }));
        
        setAllUsers(suggestedUsers);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      setError('Impossible de charger les contacts. Veuillez vous reconnecter.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs en fonction de la recherche
  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddContact = async (user) => {
    try {
      console.log('Envoi demande d\'ami à:', user.id);
      await contactService.sendFriendRequest(user.id);
      
      // Recharger les données pour mettre à jour l'affichage
      await loadContactData();
      
      alert(`Demande d'ami envoyée à ${user.name} !`);
    } catch (error) {
      console.error('Erreur envoi demande d\'ami:', error);
      alert('Erreur lors de l\'envoi de la demande d\'ami');
    }
  };

  const handleRespondToRequest = async (contactRelationId, action) => {
    try {
      console.log(`${action} demande d'ami ID:`, contactRelationId);
      await contactService.respondToFriendRequest(contactRelationId, action);
      
      // Recharger les données
      await loadContactData();
      
      const actionText = action === 'accept' ? 'acceptée' : 'refusée';
      alert(`Demande d'ami ${actionText} !`);
    } catch (error) {
      console.error('Erreur réponse demande d\'ami:', error);
      alert('Erreur lors de la réponse à la demande d\'ami');
    }
  };

  const handleRemoveContact = async (contact) => {
    const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir retirer ${contact.name} de vos amis ?`);
    
    if (!confirmDelete) return;
    
    try {
      console.log('Suppression du contact ID:', contact.contactRelationId);
      await contactService.removeContact(contact.contactRelationId);
      
      // Recharger les données pour mettre à jour l'affichage
      await loadContactData();
      
      alert(`${contact.name} a été retiré de vos amis.`);
    } catch (error) {
      console.error('Erreur suppression contact:', error);
      alert('Erreur lors de la suppression du contact');
    }
  };

  const handleMessageContact = (contact) => {
    // Stocker le contact sélectionné pour la messagerie
    localStorage.setItem('selectedContact', JSON.stringify({
      id: contact.id,
      name: contact.name,
      email: contact.email
    }));
    
    // Rediriger vers la page messagerie
    navigate('/messagerie');
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    setSearchQuery('');
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="contact-page">
        <div className="contact-container">
          <p style={{ textAlign: 'center', padding: '40px' }}>Chargement des contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contact-page">
        <div className="contact-container">
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '20px',
            borderRadius: '5px',
            margin: '20px 0',
            border: '1px solid #ffcdd2',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
          <button 
            onClick={loadContactData} 
            style={{
              display: 'block',
              margin: '20px auto',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1 className="contact-main-title">
            Mes amis <span className="brand-name">Age2meet</span>
          </h1>
        </div>
        
        <div className="contact-tabs">
          <button 
            className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact ({contacts.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'demandes' ? 'active' : ''}`}
            onClick={() => setActiveTab('demandes')}
          >
            Demandes ({pendingRequests.length})
          </button>
        </div>

        <div className="contact-content">
          {activeTab === 'contact' && (
            <div className="contact-tab-content">
              {contacts.length > 0 && (
                <div className="contacts-list-container">
                  <h3 className="contacts-subtitle">Mes contacts ({contacts.length})</h3>
                  <div className="contacts-grid">
                    {contacts.map(contact => (
                      <div key={contact.id} className="contact-card">
                        {renderAvatar(contact.profilePicture, contact.name, "contact-avatar-large")}
                        <div className="contact-details">
                          <div className="contact-card-name">{contact.name}</div>
                          <div className="contact-card-info">{contact.bio}</div>
                          <div className="contact-interests">
                            {contact.interests && contact.interests.map((interest, index) => (
                              <span key={index} className="interest-tag">{interest}</span>
                            ))}
                          </div>
                        </div>
                        <div className="contact-actions">
                          <button 
                            className="message-contact-btn"
                            onClick={() => handleMessageContact(contact)}
                            title="Envoyer un message"
                          >
                            ✉
                          </button>
                          <button 
                            className="remove-contact-btn"
                            onClick={() => handleRemoveContact(contact)}
                            title="Retirer cet ami"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {contacts.length === 0 && !isSearchOpen && (
                <p className="no-contacts-message">Aucun contact trouvé. Commencez par ajouter des amis !</p>
              )}
              
              {!isSearchOpen && (
                <button className="add-contact-button" onClick={openSearch}>
                  Ajouter un contact <span className="arrow">→</span>
                </button>
              )}

              {isSearchOpen && (
                <div className="search-container">
                  <div className="search-header">
                    <h3 className="search-title">Rechercher des utilisateurs</h3>
                    <button className="close-search-btn" onClick={closeSearch}>×</button>
                  </div>
                  
                  <div className="search-input-container">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Rechercher par nom, ville ou centre d'intérêt..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {filteredUsers.length > 0 ? (
                    <div className="users-grid">
                      {filteredUsers.map(user => {
                        const isAlreadyContact = contacts.find(contact => contact.id === user.id);
                        const isPendingRequest = pendingRequests.find(req => req.id === user.id);
                        
                        return (
                          <div key={user.id} className="user-card">
                            {renderAvatar(user.profile_picture, user.name, "user-avatar")}
                            <div className="user-details">
                              <div className="user-name">{user.name}</div>
                              <div className="user-info">{user.bio || user.location}</div>
                              <div className="user-interests">
                                {user.interests && user.interests.map((interest, index) => (
                                  <span key={index} className="interest-tag">{interest}</span>
                                ))}
                              </div>
                            </div>
                            <button 
                              className="add-user-btn"
                              onClick={() => handleAddContact(user)}
                              disabled={isAlreadyContact || isPendingRequest}
                            >
                              {isAlreadyContact ? 'Déjà ami' : 
                               isPendingRequest ? 'Demande envoyée' : 'Ajouter'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : searchQuery && (
                    <p className="no-results-message">Aucun utilisateur trouvé pour "{searchQuery}"</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'demandes' && (
            <div className="demandes-tab-content">
              {pendingRequests.length > 0 ? (
                <div className="requests-list">
                  <h3 className="requests-subtitle">Demandes reçues ({pendingRequests.length})</h3>
                  {pendingRequests.map(request => (
                    <div key={request.contactRelationId} className="request-card">
                      {renderAvatar(request.profilePicture, request.name, "request-avatar")}
                      <div className="request-details">
                        <div className="request-name">{request.name}</div>
                        <div className="request-info">{request.bio}</div>
                        <div className="request-interests">
                          {request.interests && request.interests.map((interest, index) => (
                            <span key={index} className="interest-tag">{interest}</span>
                          ))}
                        </div>
                      </div>
                      <div className="request-actions">
                        <button 
                          className="accept-btn"
                          onClick={() => handleRespondToRequest(request.contactRelationId, 'accept')}
                        >
                          Accepter
                        </button>
                        <button 
                          className="decline-btn"
                          onClick={() => handleRespondToRequest(request.contactRelationId, 'decline')}
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-requests-message">Aucune demande d'ami en attente</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}