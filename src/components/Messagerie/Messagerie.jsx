import React, { useState, useEffect } from 'react';
import { contactService, messageService, profileService, buildImageUrl } from '../../config/api';
import './Messagerie.css';

// Styles inline pour corriger les problèmes
const fixStyles = `
.messagerie-page .status {
  font-size: 0.8rem !important;
  color: #666 !important;
  font-weight: normal !important;
  background: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: none !important;
  display: inline !important;
}

.messagerie-page .send-btn {
  background: #4A90E2 !important;
  color: #FFFFFF !important;
  border: 1px solid #4A90E2 !important;
  width: 36px !important;
  height: 36px !important;
  border-radius: 6px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  font-size: 14px !important;
}

.messagerie-page .send-btn:disabled {
  background: #F7F8FA !important;
  color: #9CA3AF !important;
  border: 1px solid #E1E5E9 !important;
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}

.messagerie-page .message-actions {
  display: flex !important;
  gap: 8px !important;
}
`;

const MessagerieSection = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Charger les données au montage du composant
  useEffect(() => {
    loadInitialData();
  }, []);

  // Écouter les changements de statut depuis le profil
  useEffect(() => {
    const handleStatusUpdate = (event) => {
      console.log('Status updated - recharging contacts in messagerie:', event.detail);
      loadInitialData(); // Recharger tous les contacts avec les nouveaux statuts
    };

    window.addEventListener('statusUpdated', handleStatusUpdate);

    return () => {
      window.removeEventListener('statusUpdated', handleStatusUpdate);
    };
  }, []);

  // Vérifier s'il y a un contact pré-sélectionné depuis la page Contact
  useEffect(() => {
    const checkStoredContact = () => {
      const storedContact = localStorage.getItem('selectedContact');
      
      if (storedContact) {
        try {
          const contactData = JSON.parse(storedContact);
          setSelectedContact({
            id: contactData.id,
            name: contactData.name,
            avatar: contactData.name.charAt(0).toUpperCase()
          });
          
          // Nettoyer le localStorage après utilisation
          setTimeout(() => {
            localStorage.removeItem('selectedContact');
          }, 500);
          
        } catch (error) {
          console.error('Erreur lors de la lecture du contact stocké:', error);
        }
      }
    };

    checkStoredContact();
  }, []);

  // Recharger les messages quand on change de contact
  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
    }
  }, [selectedContact]);

  // Rafraîchir les messages automatiquement toutes les 3 secondes pour la conversation active
  useEffect(() => {
    if (selectedContact) {
      const interval = setInterval(() => {
        loadMessages(selectedContact.id);
      }, 3000); // 3 secondes
      
      return () => clearInterval(interval);
    }
  }, [selectedContact, currentUser]);

  // Fonction pour rafraîchir les statuts des contacts
  const refreshContactStatuses = async () => {
    try {
      console.log('🔄 Rafraîchissement des statuts...');
      const contactsData = await contactService.getMyContacts();
      
      if (contactsData.accepted_contacts) {
        // Mettre à jour les statuts des contacts existants
        setContacts(prevContacts => 
          prevContacts.map(contact => {
            const updatedContact = contactsData.accepted_contacts.find(c => c.id === contact.id);
            if (updatedContact) {
              console.log(`📡 Statut de ${contact.name}: ${updatedContact.status}`);
              return {
                ...contact,
                status: updatedContact.status || 'offline'
              };
            }
            return contact;
          })
        );

        // Mettre à jour le contact sélectionné aussi
        setSelectedContact(prevSelected => {
          if (prevSelected) {
            const updatedSelected = contactsData.accepted_contacts.find(c => c.id === prevSelected.id);
            if (updatedSelected) {
              console.log(`📱 Mise à jour statut contact sélectionné: ${prevSelected.name} ${prevSelected.status} → ${updatedSelected.status}`);
              return {
                ...prevSelected,
                status: updatedSelected.status || 'offline'
              };
            }
          }
          return prevSelected;
        });
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des statuts:', error);
    }
  };

  // Rafraîchir les statuts toutes les 3 secondes (quasi-instantané)
  useEffect(() => {
    const interval = setInterval(refreshContactStatuses, 3000); // 3 secondes
    return () => clearInterval(interval);
  }, []);

  // Rafraîchir la liste des contacts toutes les 10 secondes pour les derniers messages
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Rafraîchissement liste contacts...');
      loadInitialData();
    }, 10000); // 10 secondes
    
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Récupérer le profil de l'utilisateur actuel
      const profileData = await profileService.getProfile();
      const currentUserId = profileData.user.id;
      
      // Construire l'URL complète pour la photo de profil de l'utilisateur actuel
      let currentUserAvatar = buildImageUrl(profileData.profile?.profile_picture);
      
      setCurrentUser({
        id: currentUserId,
        name: profileData.user.username || `${profileData.user.first_name} ${profileData.user.last_name}`,
        avatar: currentUserAvatar || profileData.user.first_name.charAt(0).toUpperCase()
      });
      
      // Récupérer mes contacts
      const contactsData = await contactService.getMyContacts();
      console.log('Contacts récupérés:', contactsData);
      
      // Formater les contacts et récupérer leurs derniers messages
      const contactsWithLastMessages = await Promise.all(
        (contactsData.accepted_contacts || []).map(async (contact) => {
          try {
            // Récupérer les messages avec ce contact pour avoir les infos complètes de l'utilisateur
            const messagesData = await messageService.getMessages(contact.id);
            
            // Essayer de récupérer la photo de profil depuis les messages (sender/receiver)
            let contactProfilePicture = contact.profile_picture;
            if (!contactProfilePicture && messagesData && messagesData.length > 0) {
              // Chercher dans les messages pour trouver les infos du contact
              const contactMessage = messagesData.find(msg => 
                msg.sender.id === contact.id || msg.receiver.id === contact.id
              );
              if (contactMessage) {
                const contactInfo = contactMessage.sender.id === contact.id ? 
                  contactMessage.sender : contactMessage.receiver;
                contactProfilePicture = contactInfo.profile_picture;
              }
            }
            
            // Trouver le dernier message
            let lastMessage = 'Commencez votre conversation...';
            let lastMessageTime = '';
            let unreadCount = 0;
            
            if (messagesData && messagesData.length > 0) {
              const lastMsg = messagesData[messagesData.length - 1];
              lastMessage = lastMsg.content;
              lastMessageTime = new Date(lastMsg.created_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              });
              
              // Compter les messages non lus (messages reçus de ce contact)
              unreadCount = messagesData.filter(msg => 
                msg.receiver.id === currentUserId && !msg.is_read
              ).length;
              

            }
            
            // Debug: voir ce qu'on reçoit de l'API
            console.log('Contact data:', contact);
            console.log('Contact profile picture found:', contactProfilePicture);
            
            // Utiliser buildImageUrl pour construire l'URL correcte
            let fullAvatarUrl = buildImageUrl(contactProfilePicture);
            
                          return {
                id: contact.id,
                name: contact.username || `${contact.first_name} ${contact.last_name}`,
                fullName: `${contact.first_name} ${contact.last_name}`,
                avatar: fullAvatarUrl || contact.first_name.charAt(0).toUpperCase(),
                avatarIsImage: !!fullAvatarUrl,
                status: contact.status || 'offline',
                lastMessage: lastMessage,
                time: lastMessageTime,
                unread: unreadCount > 0,
                unreadCount: unreadCount
              };
          } catch (error) {
            console.error(`Erreur lors du chargement des messages pour ${contact.first_name}:`, error);
            return {
              id: contact.id,
              name: contact.username || `${contact.first_name} ${contact.last_name}`,
              fullName: `${contact.first_name} ${contact.last_name}`,
              avatar: contact.profile_picture || contact.first_name.charAt(0).toUpperCase(),
              status: contact.status || 'offline',
              lastMessage: 'Commencez votre conversation...',
              time: '',
              unread: false,
              unreadCount: 0
            };
          }
        })
      );
      
      setContacts(contactsWithLastMessages);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Impossible de charger les contacts. Veuillez vous reconnecter.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour déclencher la mise à jour des notifications dans la navbar
  const triggerNavbarUpdate = () => {
    // Déclencher un événement customisé pour notifier la navbar
    window.dispatchEvent(new CustomEvent('messagesUpdated'));
  };

  const loadMessages = async (contactId) => {
    try {
      console.log('Chargement des messages avec contact ID:', contactId);
      const messagesData = await messageService.getMessages(contactId);
      console.log('Messages récupérés:', messagesData);
      
      // Formater les messages pour l'affichage
      const formattedMessages = messagesData.map(message => ({
        id: message.id,
        content: message.content,
        senderId: message.sender.id,
        senderName: `${message.sender.first_name} ${message.sender.last_name}`,
        receiverId: message.receiver.id,
        receiverName: `${message.receiver.first_name} ${message.receiver.last_name}`,
        time: new Date(message.created_at).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isMe: message.sender.id === currentUser?.id,
        is_read: message.is_read
      }));
      
      setMessages(formattedMessages);
      
      // Marquer ce contact comme lu dans la liste des contacts
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === contactId
            ? { ...contact, unread: false, unreadCount: 0 }
            : contact
        )
      );
      
      // Déclencher la mise à jour des notifications dans la navbar
      triggerNavbarUpdate();
      
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedContact || sending) {
      return;
    }
    
    setSending(true);
    setError('');
    
    try {
      console.log('Envoi du message à:', selectedContact.id, 'Contenu:', newMessage);
      
      const response = await messageService.sendMessage(selectedContact.id, newMessage.trim());
      console.log('Message envoyé:', response);
      
      // Recharger les messages pour voir le nouveau message
      await loadMessages(selectedContact.id);
      
      // Mettre à jour le contact dans la liste avec le nouveau dernier message
      const currentTime = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === selectedContact.id
            ? { 
                ...contact, 
                lastMessage: newMessage.trim(), 
                time: currentTime,
                unread: false, // Ce message vient de nous, donc pas non lu
                unreadCount: 0
              }
            : contact
        )
      );
      
      // Vider le champ de saisie
      setNewMessage('');
      
      // Déclencher la mise à jour des notifications dans la navbar
      triggerNavbarUpdate();
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prevMessage => prevMessage + emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
                 '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
                 '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
                 '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
                 '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '🤯', '😳', '🥵',
                 '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫'];

  // Fermer le picker quand on clique ailleurs
  const handleOutsideClick = (e) => {
    if (e.target.closest('.emoji-picker') || e.target.closest('.emoji-btn')) {
      return;
    }
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if (showEmojiPicker) {
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [showEmojiPicker]);

  // Faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer && messages.length > 0) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  // Helper function pour rendre les avatars correctement
  const renderAvatar = (avatar, name, className = "") => {
    // Utiliser buildImageUrl pour construire l'URL correcte
    const imageUrl = buildImageUrl(avatar);
    
    if (imageUrl) {
      return (
        <>
          <img 
            src={imageUrl} 
            alt={name}
            className={className}
            onError={(e) => {
              console.log('Image failed to load:', avatar, 'Final URL:', imageUrl);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', imageUrl);
            }}
          />
          <span 
            className={className.replace('-img', '-letter')} 
            style={{display: 'none'}}
          >
            {name.charAt(0).toUpperCase()}
          </span>
        </>
      );
    } else {
      return (
        <span className={className.replace('-img', '-letter')}>
          {name.charAt(0).toUpperCase()}
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="messagerie-page">
        <div className="messagerie-container">
          <p style={{ textAlign: 'center', padding: '40px' }}>Chargement de la messagerie...</p>
        </div>
      </div>
    );
  }

  if (error && contacts.length === 0) {
    return (
      <div className="messagerie-page">
        <div className="messagerie-container">
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '20px',
            borderRadius: '5px',
            margin: '20px',
            border: '1px solid #ffcdd2',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
          <button 
            onClick={loadInitialData} 
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
    <div className="messagerie-page">
      <style>{`
        .messagerie-page .status {
          font-size: 0.8rem !important;
          color: #666 !important;
          font-weight: normal !important;
          background: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          display: inline !important;
        }

        .messagerie-page .send-btn {
          background: #4A90E2 !important;
          color: #FFFFFF !important;
          border: 1px solid #4A90E2 !important;
          width: 36px !important;
          height: 36px !important;
          border-radius: 6px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          font-size: 14px !important;
        }

        .messagerie-page .send-btn:disabled {
          background: #F7F8FA !important;
          color: #9CA3AF !important;
          border: 1px solid #E1E5E9 !important;
          cursor: not-allowed !important;
          opacity: 0.6 !important;
        }

        .messagerie-page .message-actions {
          display: flex !important;
          gap: 8px !important;
        }
      `}</style>
      <div className="messagerie-container">
        {/* Liste des contacts */}
        <div className="contacts-list">
          <div className="contacts-header">
            <h2>Messages</h2>
          </div>
          <div className="contacts-scroll">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
              <div
                key={contact.id}
                className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="contact-avatar">
                  {renderAvatar(contact.avatar, contact.name, 'contact-avatar-img')}
                  <div className={`status-indicator status-${contact.status}`}></div>
                </div>
                <div className="contact-info">
                  <div className="contact-header">
                    <span className="contact-name">{contact.name}</span>
                    <span className="contact-time">{contact.time}</span>
                  </div>
                  <div className="contact-message">
                    {contact.lastMessage}
                  </div>
                </div>
                {contact.unread && (
                  <div className="unread-badge">
                    {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                  </div>
                )}
              </div>
              ))
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                color: '#999',
                textAlign: 'center',
                padding: '20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>Aucune conversation</div>
                <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                  Ajoutez des contacts depuis la page<br/>
                  <strong>Mes amis</strong> pour commencer à discuter
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="conversation-area">
          {selectedContact ? (
            <>
              <div className="conversation-header">
                <div className="conversation-avatar">
                  {renderAvatar(selectedContact.avatar, selectedContact.name, 'conversation-avatar-img')}
                  <div className={`status-indicator status-${selectedContact.status}`}></div>
                </div>
                <div className="conversation-info">
                  <h3>{selectedContact.name}</h3>
                  <span className="status">
                    {selectedContact.status === 'online' ? 'En ligne' :
                     selectedContact.status === 'away' ? 'Absent' :
                     selectedContact.status === 'busy' ? 'Ne pas déranger' :
                     selectedContact.status === 'offline' ? 'Hors ligne' : 'Hors ligne'}
                  </span>
                </div>
              </div>

              <div className="messages-container">
                {messages.length > 0 ? (
                  messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.isMe ? 'message-me' : 'message-other'}`}
                  >
                    {!message.isMe && (
                      <div className="message-avatar">
                        {renderAvatar(selectedContact.avatar, selectedContact.name, 'message-avatar-img')}
                      </div>
                    )}
                    <div className="message-content">
                      <div className="message-bubble">
                        {message.content}
                      </div>
                      <div className="message-time">{message.time}</div>
                    </div>
                    {message.isMe && (
                      <div className="message-avatar">
                        {renderAvatar(currentUser?.avatar, currentUser?.name, 'message-avatar-img')}
                      </div>
                    )}
                  </div>
                  ))
                ) : (
                  <div className="no-messages">
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                    <div>Commencez votre conversation avec {selectedContact.name}</div>
                  </div>
                )}
              </div>

              {/* Zone de saisie */}
              <form className="message-input-area" onSubmit={handleSendMessage}>
                {error && (
                  <div style={{
                    color: '#c62828',
                    fontSize: '14px',
                    marginBottom: '10px',
                    textAlign: 'center'
                  }}>
                    {error}
                  </div>
                )}
                
                <div className="message-input-container">
                <input
                  type="text"
                  value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Écrivez votre message..."
                  className="message-input"
                    disabled={sending}
                />
                  
                  <div className="message-actions">
                    <button 
                      type="button" 
                      className="emoji-btn"
                      onClick={toggleEmojiPicker}
                      disabled={sending}
                    >
                      😊
                    </button>
                    
                    <button 
                      type="submit" 
                      className="send-btn"
                      disabled={!newMessage.trim() || sending}
                    >
                      {sending ? '⏳' : '📤'}
                    </button>
                  </div>
                </div>

                {/* Picker d'émojis */}
                {showEmojiPicker && (
                  <div className="emoji-picker">
                    <div className="emoji-grid">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          className="emoji-item"
                          onClick={() => handleEmojiClick(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="no-contact-selected">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <div>Sélectionnez un contact pour commencer une conversation</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagerieSection;
