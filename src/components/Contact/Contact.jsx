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
  const [sentRequests, setSentRequests] = useState([]); // NOUVEAU: Demandes envoyées
  const [allUsers, setAllUsers] = useState([]);
  const [persistentUsers, setPersistentUsers] = useState([]); // Liste persistante des utilisateurs
  const [highlightedUserId, setHighlightedUserId] = useState(null); // NOUVEAU: Pour mettre en évidence une personne
  
  const navigate = useNavigate();

  // Helper function pour rendre les avatars correctement
  const renderAvatar = (profilePicture, name, className = "contact-avatar-large") => {
    console.log('renderAvatar called with:', { profilePicture, name }); // Debug log
    
    // Vérifier si nous avons une URL d'image valide
    const isImageUrl = profilePicture && 
      (profilePicture.includes('http') || 
       profilePicture.includes('/media/') || 
       profilePicture.includes('cloudinary') ||
       profilePicture.includes('amazonaws') ||
       profilePicture.includes('.jpg') ||
       profilePicture.includes('.jpeg') ||
       profilePicture.includes('.png') ||
       profilePicture.includes('.gif') ||
       profilePicture.includes('.webp'));
    
    const imageUrl = isImageUrl ? 
      (profilePicture.startsWith('/media/') ? `http://localhost:8000${profilePicture}` : profilePicture) : 
      null;
    
    // Générer un avatar automatique si pas d'image
    const autoAvatar = !isImageUrl ? 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=70D9FF&color=fff&size=128&rounded=true&bold=true` :
      null;
    
    console.log('Image URL logic:', { isImageUrl, imageUrl, autoAvatar }); // Debug log
    
    if (isImageUrl || autoAvatar) {
      return (
        <div className={className}>
          <img 
            src={imageUrl || autoAvatar} 
            alt={name}
            className="avatar-image"
            onError={(e) => {
              console.log('Image failed to load:', profilePicture, 'URL:', imageUrl || autoAvatar);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', imageUrl || autoAvatar);
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
      console.log('Using letter avatar for:', name, 'profilePicture was:', profilePicture);
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
    // Charger les utilisateurs persistants depuis localStorage
    const savedUsers = localStorage.getItem('persistentUsers');
    if (savedUsers) {
      try {
        setPersistentUsers(JSON.parse(savedUsers));
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs persistants:', error);
      }
    }
    
    // Charger les demandes envoyées depuis localStorage
    const savedSentRequests = localStorage.getItem('sentRequests');
    if (savedSentRequests) {
      try {
        const sentRequestsData = JSON.parse(savedSentRequests);
        setSentRequests(sentRequestsData);
        console.log('📤 Demandes envoyées chargées:', sentRequestsData.length);
      } catch (error) {
        console.error('Erreur lors du chargement des demandes envoyées:', error);
      }
    }
    
    loadContactData();
  }, []);

  const loadContactData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Récupérer mes contacts depuis l'API
      const contactsData = await contactService.getMyContacts();
      console.log('🔍 DONNÉES COMPLÈTES de l\'API:', contactsData);
      console.log('🔍 Clés disponibles:', Object.keys(contactsData));
      
      // Debug: vérifier toutes les propriétés des données
      if (contactsData.pending_requests) {
        console.log('📥 Demandes REÇUES:', contactsData.pending_requests.length);
        contactsData.pending_requests.forEach(request => {
          console.log('  - Demande de:', request.user.username, 'ID:', request.user.id);
        });
      }
      
      if (contactsData.sent_requests) {
        console.log('📤 Demandes ENVOYÉES depuis API:', contactsData.sent_requests.length);
        contactsData.sent_requests.forEach(request => {
          console.log('  - Demande vers:', request.contact.username, 'ID:', request.contact.id);
        });
      } else {
        console.log('📤 Aucune propriété sent_requests dans l\'API');
      }
      
      if (contactsData.accepted_contacts) {
        console.log('✅ Contacts ACCEPTÉS:', contactsData.accepted_contacts.length);
        contactsData.accepted_contacts.forEach(contact => {
          console.log('  - Ami:', contact.username, 'ID:', contact.id);
        });
      }
      
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
        profilePicture: contact.profile_picture || contact.profilePicture || contact.avatar || contact.image || contact.photo,
        contactRelationId: contact.contact_relation_id
      }));
      
      // Descriptions variées pour les demandes d'ami
      const requestDescriptions = [
        "Souhaite partager des moments conviviaux et découvrir de nouveaux amis",
        "À la recherche de nouvelles amitiés pour enrichir son quotidien",
        "Passionné par les rencontres authentiques et les échanges enrichissants",
        "Aime créer des liens durables et partager des expériences communes",
        "Cherche à élargir son cercle d'amis pour de belles aventures",
        "Apprécie la convivialité et souhaite tisser de nouveaux liens",
        "Ouvert aux rencontres et aux nouvelles découvertes ensemble",
        "Désire créer des amitiés sincères et durables"
      ];

      // Formater les demandes en attente
      const formattedRequests = pendingContactRequests.map(request => {
        const descriptionIndex = request.user.id % requestDescriptions.length;
        const defaultBio = requestDescriptions[descriptionIndex];
        
        return {
          id: request.user.id,
          name: request.user.username || `${request.user.first_name} ${request.user.last_name}`,
          fullName: `${request.user.first_name} ${request.user.last_name}`,
          email: request.user.email,
          bio: request.user.bio || request.user.description || defaultBio,
          location: request.user.location || 'Non spécifié',
          interests: request.user.interests ? request.user.interests.split(',').map(i => i.trim()) : [],
          status: 'pending',
          profilePicture: request.user.profile_picture || request.user.profilePicture || request.user.avatar || request.user.image || request.user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.user.username || 'User')}&background=70D9FF&color=fff&size=128&rounded=true&bold=true`,
          contactRelationId: request.id
        };
      });
      
      setContacts(formattedContacts);
      setPendingRequests(formattedRequests);
      
      // NOUVEAU: Gérer les demandes envoyées depuis l'API
      const sentContactRequests = contactsData.sent_requests || [];
      console.log('📤 Traitement des demandes envoyées depuis API:', sentContactRequests.length);
      
      const formattedSentRequests = sentContactRequests.map(request => {
        const descriptionIndex = request.contact.id % requestDescriptions.length;
        const defaultBio = requestDescriptions[descriptionIndex];
        
        return {
          id: request.contact.id,
          name: request.contact.username || `${request.contact.first_name} ${request.contact.last_name}`,
          fullName: `${request.contact.first_name} ${request.contact.last_name}`,
          email: request.contact.email,
          bio: request.contact.bio || request.contact.description || defaultBio,
          location: request.contact.location || 'Non spécifié',
          interests: request.contact.interests ? request.contact.interests.split(',').map(i => i.trim()) : [],
          profilePicture: request.contact.profile_picture || request.contact.profilePicture || request.contact.avatar || request.contact.image || request.contact.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.contact.username || 'User')}&background=70D9FF&color=fff&size=128&rounded=true&bold=true`,
          status: 'sent',
          sentAt: request.created_at || new Date().toISOString()
        };
      });
      
      // Fusionner avec les demandes envoyées du localStorage
      const currentSentFromStorage = JSON.parse(localStorage.getItem('sentRequests') || '[]');
      console.log('📤 Demandes envoyées depuis localStorage:', currentSentFromStorage.length);
      
      // OBTENIR L'ID DE L'UTILISATEUR ACTUEL POUR ÉVITER L'AUTO-AJOUT
      const currentUserId = parseInt(localStorage.getItem('userId'));
      
      // Créer une map pour éviter les doublons
      const sentRequestsMap = new Map();
      
      // Ajouter les demandes de l'API d'abord (priorité) - avec protection anti-auto-ajout
      formattedSentRequests.forEach(request => {
        if (request.id !== currentUserId) {
          sentRequestsMap.set(request.id, request);
          console.log('📤 Ajout demande API:', request.name);
        } else {
          console.log('❌ Auto-ajout détecté depuis API - ignoré:', request.name);
        }
      });
      
      // Ajouter les demandes du localStorage qui ne sont pas dans l'API - avec protection anti-auto-ajout
      currentSentFromStorage.forEach(request => {
        if (request.id !== currentUserId && !sentRequestsMap.has(request.id)) {
          sentRequestsMap.set(request.id, request);
          console.log('📤 Ajout demande localStorage:', request.name);
        } else if (request.id === currentUserId) {
          console.log('❌ Auto-ajout détecté depuis localStorage - ignoré:', request.name);
        }
      });
      
      const finalSentRequests = Array.from(sentRequestsMap.values());
      console.log('📤 Total demandes envoyées finales:', finalSentRequests.length);
      
      setSentRequests(finalSentRequests);
      
      // Sauvegarder la liste fusionnée dans localStorage (déjà nettoyée des auto-ajouts)
      localStorage.setItem('sentRequests', JSON.stringify(finalSentRequests));
      
      // Ajouter les utilisateurs des demandes d'ami à la liste persistante
      if (formattedRequests.length > 0) {
        const currentPersistent = JSON.parse(localStorage.getItem('persistentUsers') || '[]');
        const persistentMap = new Map();
        
        // Ajouter les utilisateurs persistants existants
        currentPersistent.forEach(user => {
          persistentMap.set(user.id, user);
        });
        
        // Ajouter les utilisateurs des demandes d'ami
        formattedRequests.forEach(request => {
          if (!persistentMap.has(request.id)) {
            persistentMap.set(request.id, {
              id: request.id,
              name: request.name,
              fullName: request.fullName,
              email: request.email,
              bio: request.bio,
              location: request.location,
              interests: request.interests,
              profile_picture: request.profilePicture
            });
          }
        });
        
        const updatedPersistent = Array.from(persistentMap.values());
        localStorage.setItem('persistentUsers', JSON.stringify(updatedPersistent));
        setPersistentUsers(updatedPersistent);
      }
      
      // Récupérer les utilisateurs suggérés
      const homeData = await userService.getAllUsers();
      console.log('Données accueil:', homeData);
      
      // Debug: vérifier les photos de profil des utilisateurs suggérés
      if (homeData.suggested_contacts) {
        homeData.suggested_contacts.forEach(user => {
          console.log('Utilisateur suggéré:', user.username, 'photo:', user.profile_picture);
          console.log('Tous les champs utilisateur suggéré:', Object.keys(user));
        });
      }
      
      if (homeData.suggested_contacts) {
        // Descriptions variées pour les utilisateurs suggérés
        const defaultDescriptions = [
          "Passionné par les rencontres et les nouvelles expériences",
          "J'aime partager des moments conviviaux autour d'un bon repas",
          "Amateur de balades en nature et de découvertes culturelles",
          "Toujours prêt(e) pour une nouvelle aventure ou un bon livre",
          "J'apprécie les discussions enrichissantes et les activités créatives",
          "Fervent défenseur de la joie de vivre et des relations authentiques",
          "Curieux de nature, j'aime apprendre et découvrir de nouveaux horizons",
          "Entre tradition et modernité, je cultive l'art de bien vivre",
          "Passionné par l'art, la musique et les rencontres sincères",
          "J'aime transmettre mon expérience tout en apprenant des autres"
        ];

        const suggestedUsers = homeData.suggested_contacts.map(user => {
          // Utiliser l'ID pour avoir une description consistante pour chaque utilisateur
          const descriptionIndex = user.id % defaultDescriptions.length;
          const defaultBio = defaultDescriptions[descriptionIndex];
          
          return {
            id: user.id,
            name: user.username || `${user.first_name} ${user.last_name}`,
            fullName: `${user.first_name} ${user.last_name}`,
            email: user.username,
            bio: user.bio || user.description || user.bio_text || user.about || defaultBio,
            location: user.location || 'Non spécifié',
            interests: user.interests ? user.interests.split(',').map(i => i.trim()) : [],
            profile_picture: user.profile_picture || user.profilePicture || user.avatar || user.image || user.photo
          };
        });
        
        // Fusionner avec les utilisateurs persistants pour éviter de perdre ceux qui ont été refusés
        const currentPersistent = JSON.parse(localStorage.getItem('persistentUsers') || '[]');
        console.log('🔍 Utilisateurs persistants chargés:', currentPersistent.length, currentPersistent.map(u => u.name));
        console.log('🔍 Nouvelles suggestions API:', suggestedUsers.length, suggestedUsers.map(u => u.name));
        
        const allUsersMap = new Map();
        
        // Ajouter les utilisateurs persistants d'abord
        currentPersistent.forEach(user => {
          allUsersMap.set(user.id, user);
          console.log('➕ Ajout utilisateur persistant:', user.name);
        });
        
        // Ajouter/mettre à jour avec les nouveaux utilisateurs suggérés
        suggestedUsers.forEach(user => {
          allUsersMap.set(user.id, user);
          console.log('➕ Ajout/mise à jour suggestion:', user.name);
        });
        
        // Convertir en tableau et sauvegarder
        const mergedUsers = Array.from(allUsersMap.values());
        console.log('🎯 Total utilisateurs fusionnés:', mergedUsers.length, mergedUsers.map(u => u.name));
        
        localStorage.setItem('persistentUsers', JSON.stringify(mergedUsers));
        setPersistentUsers(mergedUsers);
        
        setAllUsers(mergedUsers);
      } else {
        // Si pas de suggestions de l'API, utiliser seulement les utilisateurs persistants
        const currentPersistent = JSON.parse(localStorage.getItem('persistentUsers') || '[]');
        setPersistentUsers(currentPersistent);
        setAllUsers(currentPersistent);
        console.log('Aucune suggestion API, utilisation des utilisateurs persistants:', currentPersistent.length);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      setError('Impossible de charger les contacts. Veuillez vous reconnecter.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs en fonction de la recherche ET exclure ceux qui ont déjà une relation
  const filteredUsers = allUsers.filter(user => {
    // Exclure les utilisateurs déjà amis
    const isAlreadyFriend = contacts.some(contact => contact.id === user.id);
    
    // Exclure les utilisateurs qui ont une demande en attente (reçue)
    const hasPendingRequest = pendingRequests.some(request => request.id === user.id);
    
    // Exclure les utilisateurs à qui on a déjà envoyé une demande
    const hasSentRequest = sentRequests.some(request => request.id === user.id);
    
    // Filtrer par recherche
    const matchesSearch = !searchQuery || (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    console.log(`🔍 Filtrage utilisateur ${user.name} (ID: ${user.id}):`, {
      isAlreadyFriend,
      hasPendingRequest,
      hasSentRequest,
      matchesSearch,
      shouldShow: !isAlreadyFriend && !hasPendingRequest && !hasSentRequest && matchesSearch
    });
    
    return !isAlreadyFriend && !hasPendingRequest && !hasSentRequest && matchesSearch;
  });

  const handleAddContact = async (user) => {
    try {
      console.log('Envoi demande d\'ami à:', user.id);
      await contactService.sendFriendRequest(user.id);
      
      // Ajouter l'utilisateur à la liste des demandes envoyées
      const newSentRequest = {
        id: user.id,
        name: user.name,
        fullName: user.fullName,
        email: user.email,
        bio: user.bio,
        location: user.location,
        interests: user.interests,
        profilePicture: user.profile_picture,
        status: 'sent',
        sentAt: new Date().toISOString()
      };
      
      setSentRequests(prevSent => [...prevSent, newSentRequest]);
      
      // Sauvegarder dans localStorage pour persistance
      const currentSent = JSON.parse(localStorage.getItem('sentRequests') || '[]');
      const updatedSent = [...currentSent, newSentRequest];
      localStorage.setItem('sentRequests', JSON.stringify(updatedSent));
      
      console.log('✅ Demande ajoutée à la liste des demandes envoyées');
      
      // Recharger les données pour mettre à jour l'affichage
      await loadContactData();
      
      alert(`Demande d'ami envoyée à ${user.name} !`);
    } catch (error) {
      console.error('Erreur envoi demande d\'ami:', error);
      
      // Si l'erreur est "Relation déjà existante", rediriger vers l'onglet Demandes
      if (error.message.includes('Relation déjà existante')) {
        console.log('🔄 Relation existante détectée, redirection vers l\'onglet Demandes');
        
        // Recharger les données pour synchroniser l'état
        const updatedContactsData = await contactService.getMyContacts();
        console.log('🔄 Données rechargées:', updatedContactsData);
        
        // Vérifier directement dans les données fraîches
        const isInAcceptedContacts = (updatedContactsData.accepted_contacts || []).some(contact => contact.id === user.id);
        const isInPendingRequests = (updatedContactsData.pending_requests || []).some(request => request.user.id === user.id);
        const isInSentRequests = (updatedContactsData.sent_requests || []).some(request => request.user.id === user.id);
        
        console.log('🔍 Vérification dans données fraîches:', {
          userId: user.id,
          userName: user.name,
          isInAcceptedContacts,
          isInPendingRequests,
          isInSentRequests
        });
        
        // Si la personne n'est trouvée nulle part, c'est probablement une demande envoyée non trackée
        if (!isInAcceptedContacts && !isInPendingRequests && !isInSentRequests) {
          console.log('🤔 Personne non trouvée dans les données API - ajout aux demandes envoyées');
          
          // Vérifier que l'utilisateur ne s'ajoute pas lui-même
          const currentUserId = parseInt(localStorage.getItem('userId'));
          if (user.id === currentUserId) {
            console.log('❌ Tentative d\'auto-ajout détectée - ignorée');
            return;
          }
          
          // Créer une entrée de demande envoyée
          const newSentRequest = {
            id: user.id,
            name: user.name,
            fullName: user.fullName,
            email: user.email,
            bio: user.bio,
            location: user.location,
            interests: user.interests,
            profilePicture: user.profile_picture,
            status: 'sent',
            sentAt: new Date().toISOString()
          };
          
          // Ajouter aux demandes envoyées dans localStorage
          const currentSent = JSON.parse(localStorage.getItem('sentRequests') || '[]');
          const updatedSent = [...currentSent, newSentRequest];
          localStorage.setItem('sentRequests', JSON.stringify(updatedSent));
          console.log('✅ Ajouté aux demandes envoyées dans localStorage:', user.name);
        }
        
        // Recharger les données du composant maintenant
        await loadContactData();
        
        // Mettre en évidence l'utilisateur et rediriger vers l'onglet Demandes
        setHighlightedUserId(user.id);
        setActiveTab('demandes');
        
        // Fermer la recherche
        setIsSearchOpen(false);
        
        // Retirer la mise en évidence après 3 secondes
        setTimeout(() => {
          setHighlightedUserId(null);
        }, 3000);
        
        console.log('✅ Redirection vers l\'onglet Demandes avec mise en évidence de l\'utilisateur ID:', user.id);
        
      } else {
        alert('Erreur lors de l\'envoi de la demande d\'ami');
      }
    }
  };

  const handleRespondToRequest = async (contactRelationId, action) => {
    try {
      console.log(`${action} demande d'ami ID:`, contactRelationId);
      
      // Sauvegarder l'utilisateur dans la liste persistante AVANT de répondre à la demande
      if (action === 'decline') {
        const userToSave = pendingRequests.find(req => req.contactRelationId === contactRelationId);
        if (userToSave) {
          console.log('💾 Sauvegarde utilisateur refusé:', userToSave.name);
          
          const currentPersistent = JSON.parse(localStorage.getItem('persistentUsers') || '[]');
          const persistentMap = new Map();
          
          // Ajouter les utilisateurs persistants existants
          currentPersistent.forEach(user => {
            persistentMap.set(user.id, user);
          });
          
          // Ajouter l'utilisateur refusé
          persistentMap.set(userToSave.id, {
            id: userToSave.id,
            name: userToSave.name,
            fullName: userToSave.fullName,
            email: userToSave.email,
            bio: userToSave.bio,
            location: userToSave.location,
            interests: userToSave.interests,
            profile_picture: userToSave.profilePicture
          });
          
          const updatedPersistent = Array.from(persistentMap.values());
          localStorage.setItem('persistentUsers', JSON.stringify(updatedPersistent));
          setPersistentUsers(updatedPersistent);
          
          console.log('💾 Utilisateur sauvegardé, total persistants:', updatedPersistent.length);
        }
      }
      
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

  // Fonction pour nettoyer le localStorage
  const cleanLocalStorage = () => {
    console.log('🧹 Nettoyage du localStorage...');
    localStorage.removeItem('sentRequests');
    localStorage.removeItem('persistentUsers');
    console.log('✅ localStorage nettoyé');
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
            Demandes ({pendingRequests.length + sentRequests.length})
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
                              <div className="user-info">{user.bio}</div>
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
                  <div className="contacts-grid">
                    {pendingRequests.map(request => (
                      <div 
                        key={request.contactRelationId} 
                        className={`contact-card ${highlightedUserId === request.id ? 'highlighted-card' : ''}`}
                      >
                        {renderAvatar(request.profilePicture, request.name, "contact-avatar-large")}
                        <div className="contact-details">
                          <div className="contact-card-name">{request.name}</div>
                          <div className="contact-card-info">{request.bio}</div>
                          <div className="contact-interests">
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
                </div>
              ) : (
                <p className="no-requests-message">Aucune demande d'ami reçue</p>
              )}
              
              {/* NOUVELLE SECTION: Demandes envoyées */}
              {sentRequests.length > 0 && (
                <div className="sent-requests-list">
                  <h3 className="requests-subtitle">Demandes envoyées ({sentRequests.length})</h3>
                  <div className="contacts-grid">
                    {sentRequests.map(request => (
                      <div 
                        key={request.id} 
                        className={`contact-card sent-request-card ${highlightedUserId === request.id ? 'highlighted-card' : ''}`}
                      >
                        {renderAvatar(request.profilePicture, request.name, "contact-avatar-large")}
                        <div className="contact-details">
                          <div className="contact-card-name">{request.name}</div>
                          <div className="contact-card-info">{request.bio}</div>
                          <div className="contact-interests">
                            {request.interests && request.interests.map((interest, index) => (
                              <span key={index} className="interest-tag">{interest}</span>
                            ))}
                          </div>
                        </div>
                        <div className="request-status">
                          <span className="status-badge sent-badge">En attente</span>
                          <small className="sent-date">
                            Envoyée le {new Date(request.sentAt).toLocaleDateString('fr-FR')}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {pendingRequests.length === 0 && sentRequests.length === 0 && (
                <p className="no-requests-message">Aucune demande d'ami</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}