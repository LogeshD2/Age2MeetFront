import React, { useState, useEffect } from 'react';
import './Activities.css';

const ActivitiesPage = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [registeredActivities, setRegisteredActivities] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const activities = [
    {
      id: 1,
      title: "Atelier Cuisine Intergénérationnel - Paris 14e",
      location: "Maison des associations, Paris 14e",
      date: "Mercredi 9 juillet 2025",
      time: "14h30 – 16h30",
      fullDate: "2025-07-09",
      startTime: "14:30",
      description: "Apprendre à cuisiner ensemble des recettes traditionnelles françaises dans une ambiance conviviale. Moment de transmission, de partage et de dégustation.",
      image: "🍅👵👴🍳"
    },
    {
      id: 2,
      title: "Balade culturelle au Parc de Sceaux",
      location: "Domaine de Sceaux (RER B)",
      date: "Vendredi 11 juillet 2025",
      time: "10h – 12h",
      fullDate: "2025-07-11",
      startTime: "10:00",
      description: "Promenade guidée à travers les jardins d'André Le Nôtre, découverte de l'histoire du château, temps calme autour du bassin.",
      image: "🏰🌳👵👴🚶‍♀️"
    },
    {
      id: 3,
      title: "Café-lecture \"Souvenirs et Saisons\" – Vincennes",
      location: "Bibliothèque municipale, Vincennes",
      date: "Samedi 12 juillet 2025",
      time: "10h – 12h",
      fullDate: "2025-07-12",
      startTime: "10:00",
      description: "Rencontre autour d'extraits littéraires et de souvenirs partagés. Thème du mois : les saisons de la vie. Boissons chaudes offertes, lecture à voix haute par un bibliothécaire.",
      image: "📚☕👵👴📖"
    }
  ];

  // Vérifier l'état de connexion et charger les inscriptions
  useEffect(() => {
    console.log('🎛️ Activities: useEffect monté - installation des listeners');
    
    const checkLoginAndLoadData = () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      console.log('🔐 Activities: Vérification connexion');
      console.log('🔐 Token trouvé:', token);
      console.log('🔐 UserId trouvé:', userId);
      console.log('🔐 Token valide:', !!token);
      console.log('🔐 UserId valide:', !!userId);
      
      // Temporaire: utiliser seulement userId pour la connexion
      const isUserLoggedIn = !!userId;
      console.log('🔐 Résultat isLoggedIn (basé sur userId seulement):', isUserLoggedIn);
      
      setIsLoggedIn(isUserLoggedIn);
      
      if (userId) { // Utiliser seulement userId
        // Utilisateur connecté : charger ses inscriptions
        const userKey = `registeredActivities_${userId}`;
        const saved = localStorage.getItem(userKey);
        console.log('🔐 Clé utilisateur:', userKey);
        console.log('🔐 Inscriptions sauvées:', saved);
        
        const savedRegistrations = saved ? JSON.parse(saved) : [];
        
        // NOUVELLE VÉRIFICATION : Synchroniser avec l'agenda
        console.log('🔄 Vérification synchronisation avec l\'agenda...');
        
        // Utiliser le nouveau système de stockage utilisateur
        const userActivities = JSON.parse(localStorage.getItem('userActivities') || '{}');
        const userAgendaEvents = userActivities[userId]?.agendaEvents || [];
        
        console.log('🔄 userActivities:', userActivities);
        console.log('🔄 userAgendaEvents pour userId', userId, ':', userAgendaEvents);
        
        const agendaActivityIds = userAgendaEvents
          .filter(event => event.isActivity && event.activityId)
          .map(event => event.activityId);
        
        console.log('🔄 IDs activités dans agenda:', agendaActivityIds);
        console.log('🔄 IDs dans inscriptions:', savedRegistrations);
        
        // Garder seulement les inscriptions qui ont encore un événement dans l'agenda
        const syncedRegistrations = savedRegistrations.filter(id => agendaActivityIds.includes(id));
        
        if (syncedRegistrations.length !== savedRegistrations.length) {
          console.log('🔄 Inscriptions désynchronisées détectées !');
          console.log('🔄 Anciennes inscriptions:', savedRegistrations);
          console.log('🔄 Nouvelles inscriptions synchronisées:', syncedRegistrations);
          
          // Mettre à jour le localStorage
          localStorage.setItem(userKey, JSON.stringify(syncedRegistrations));
          setRegisteredActivities(syncedRegistrations);
        } else {
          console.log('🔄 Inscriptions déjà synchronisées');
          setRegisteredActivities(savedRegistrations);
        }
      } else {
        // Pas connecté : vider les inscriptions
        console.log('🔐 Utilisateur non connecté - vidage des inscriptions');
        setRegisteredActivities([]);
      }
    };

    checkLoginAndLoadData();
    
    // Écouter les changements de connexion
    window.addEventListener('storage', checkLoginAndLoadData);
    
    // NOUVEAU: Écouter les mises à jour depuis l'agenda
    const handleUserActivitiesUpdate = () => {
      console.log('🔔 Activities: Événement userActivitiesUpdated reçu - resynchronisation forcée');
      checkLoginAndLoadData(); // Forcer une nouvelle vérification
    };
    
    window.addEventListener('userActivitiesUpdated', handleUserActivitiesUpdate);
    
    // Test de fonctionnement des événements personnalisés
    console.log('🎛️ Activities: Test du système d\'événements...');
    const testEvent = () => {
      console.log('🧪 Test événement reçu !');
    };
    window.addEventListener('testEvent', testEvent);
    
    // Émettre un événement de test
    setTimeout(() => {
      console.log('🎛️ Activities: Émission événement de test');
      window.dispatchEvent(new CustomEvent('testEvent'));
    }, 100);
    
    // Écouter les désinscriptions depuis l'agenda
    const handleUnregister = (event) => {
      console.log('🎧 Événement unregisterActivity reçu:', event);
      console.log('🎧 Event detail:', event.detail);
      
      const { activityId } = event.detail;
      console.log('📩 activityId extrait:', activityId);
      
      // Vérifier si l'utilisateur est connecté
      const userId = localStorage.getItem('userId');
      const currentIsLoggedIn = !!userId; // Utiliser seulement userId comme dans checkLoginAndLoadData
      
      console.log('📩 currentIsLoggedIn:', currentIsLoggedIn);
      
      if (activityId && currentIsLoggedIn && userId) {
        console.log('✅ Conditions remplies, procédure de désinscription');
        
        // Récupérer les inscriptions actuelles
        const userKey = `registeredActivities_${userId}`;
        const currentRegistrations = JSON.parse(localStorage.getItem(userKey) || '[]');
        console.log('📩 currentRegistrations:', currentRegistrations);
        
        // Supprimer l'inscription
        const newRegistrations = currentRegistrations.filter(id => id !== activityId);
        console.log('📩 newRegistrations:', newRegistrations);
        
        // Mettre à jour le localStorage
        localStorage.setItem(userKey, JSON.stringify(newRegistrations));
        
        // Mettre à jour l'état avec une fonction de mise à jour
        setRegisteredActivities(prevRegistrations => {
          const updated = prevRegistrations.filter(id => id !== activityId);
          console.log('🔄 Mise à jour état registeredActivities:', updated);
          return updated;
        });
        
        // Supprimer de l'agenda - utiliser le nouveau système
        const userActivities = JSON.parse(localStorage.getItem('userActivities') || '{}');
        if (userActivities[userId]?.agendaEvents) {
          const updatedEvents = userActivities[userId].agendaEvents.filter(event => event.activityId !== activityId);
          userActivities[userId].agendaEvents = updatedEvents;
          localStorage.setItem('userActivities', JSON.stringify(userActivities));
          console.log('📩 Événement supprimé du nouveau système agenda');
        }
        
        // Déclencher la mise à jour de l'agenda
        window.dispatchEvent(new CustomEvent('agendaUpdated'));
        window.dispatchEvent(new CustomEvent('userActivitiesUpdated'));
        
        console.log('✅ Désinscription depuis agenda terminée');
      } else {
        console.log('❌ Conditions non remplies pour la désinscription');
        console.log('   - activityId:', activityId);
        console.log('   - currentIsLoggedIn:', currentIsLoggedIn);
        console.log('   - userId:', userId);
      }
    };
    
    // Listener de test pour vérifier la communication
    const handleTestFromAgenda = () => {
      console.log('🧪 Activities: Événement de test reçu depuis Agenda !');
    };
    
    console.log('🎛️ Activities: Installation des listeners d\'événements');
    window.addEventListener('unregisterActivity', handleUnregister);
    window.addEventListener('testFromAgenda', handleTestFromAgenda);
    
    return () => {
      console.log('🎛️ Activities: Nettoyage des listeners');
      window.removeEventListener('storage', checkLoginAndLoadData);
      window.removeEventListener('userActivitiesUpdated', handleUserActivitiesUpdate);
      window.removeEventListener('unregisterActivity', handleUnregister);
      window.removeEventListener('testFromAgenda', handleTestFromAgenda);
      window.removeEventListener('testEvent', testEvent);
    };
  }, []); // Pas de dépendances pour éviter les problèmes de fermeture

  const saveUserRegistrations = (newRegistrations) => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const userKey = `registeredActivities_${userId}`;
      localStorage.setItem(userKey, JSON.stringify(newRegistrations));
    }
  };

  const addEventToAgenda = (activity) => {
    const newEvent = {
      id: Date.now() + Math.random(),
      title: activity.title,
      description: `${activity.description}\n\nLieu: ${activity.location}`,
      type: 'social',
      date: activity.fullDate,
      time: activity.startTime,
      isActivity: true,
      activityId: activity.id
    };

    // Utiliser le nouveau système de stockage utilisateur
    const userId = localStorage.getItem('userId');
    if (userId) {
      const userActivities = JSON.parse(localStorage.getItem('userActivities') || '{}');
      if (!userActivities[userId]) userActivities[userId] = {};
      if (!userActivities[userId].agendaEvents) userActivities[userId].agendaEvents = [];
      
      userActivities[userId].agendaEvents.push(newEvent);
      localStorage.setItem('userActivities', JSON.stringify(userActivities));
      
      console.log('✅ Événement ajouté au nouveau système:', newEvent);
      console.log('✅ UserActivities après ajout:', userActivities);
    }
    
    // Déclencher la mise à jour de l'agenda
    window.dispatchEvent(new CustomEvent('agendaUpdated'));
    window.dispatchEvent(new CustomEvent('userActivitiesUpdated'));
    
    console.log('✅ Événement ajouté à l\'agenda:', newEvent);
    return newEvent;
  };

  const removeEventFromAgenda = (activityId) => {
    // Utiliser le nouveau système de stockage utilisateur
    const userId = localStorage.getItem('userId');
    if (userId) {
      const userActivities = JSON.parse(localStorage.getItem('userActivities') || '{}');
      if (userActivities[userId]?.agendaEvents) {
        const updatedEvents = userActivities[userId].agendaEvents.filter(event => event.activityId !== activityId);
        userActivities[userId].agendaEvents = updatedEvents;
        localStorage.setItem('userActivities', JSON.stringify(userActivities));
        
        console.log('❌ Événement retiré du nouveau système pour l\'activité:', activityId);
        console.log('❌ UserActivities après suppression:', userActivities);
      }
    }
    
    // Déclencher la mise à jour de l'agenda
    window.dispatchEvent(new CustomEvent('agendaUpdated'));
    window.dispatchEvent(new CustomEvent('userActivitiesUpdated'));
    
    console.log('❌ Événement retiré de l\'agenda pour l\'activité:', activityId);
  };

  const unregisterFromActivity = (activityId) => {
    console.log('🔄 unregisterFromActivity appelée avec:', activityId);
    console.log('📋 Inscriptions actuelles:', registeredActivities);
    
    const newRegistrations = registeredActivities.filter(id => id !== activityId);
    console.log('📋 Nouvelles inscriptions:', newRegistrations);
    
    setRegisteredActivities(newRegistrations);
    saveUserRegistrations(newRegistrations);
    removeEventFromAgenda(activityId);
    
    console.log('✅ Désinscription terminée');
  };

  const handleRegisterClick = (activity) => {
    if (!isLoggedIn) {
      alert('Vous devez être connecté pour vous inscrire à une activité. Veuillez vous connecter d\'abord.');
      return;
    }
    
    setSelectedActivity(activity);
    setShowConfirmModal(true);
  };

  const confirmRegistration = () => {
    if (!selectedActivity || !isLoggedIn) return;

    try {
      console.log('🎯 Inscription à l\'activité:', selectedActivity.title);
      
      // Ajouter l'inscription
      const newRegistrations = [...registeredActivities, selectedActivity.id];
      setRegisteredActivities(newRegistrations);
      saveUserRegistrations(newRegistrations);
      
      // Ajouter à l'agenda
      addEventToAgenda(selectedActivity);

      setShowConfirmModal(false);
      setSelectedActivity(null);
      
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      alert(error.message);
    }
  };

  const isActivityRegistered = (activityId) => {
    return registeredActivities.includes(activityId);
  };

  return (
    <div className="activities-container">
      <div className="activities-card">
        <h1 className="activities-title">Activités à venir</h1>
        
        {!isLoggedIn && (
          <div className="login-notice">
            <p>⚠️ Vous devez être connecté pour vous inscrire aux activités.</p>
            <p><a href="/login">Connectez-vous ici</a></p>
          </div>
        )}
        
        <div className="activities-grid">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-card">
              <div className="activity-image">
                <span className="activity-emoji">{activity.image}</span>
              </div>
              
              <div className="activity-content">
                <h3 className="activity-title">{activity.title}</h3>
                
                <div className="activity-details">
                  <p><strong>Lieu :</strong> {activity.location}</p>
                  <p><strong>Date :</strong> {activity.date}</p>
                  <p><strong>Heure :</strong> {activity.time}</p>
                </div>
                
                <div className="activity-description">
                  <p><strong>Description :</strong></p>
                  <p>{activity.description}</p>
                </div>
                
                <button 
                  className={`register-button ${isActivityRegistered(activity.id) ? 'registered' : ''} ${!isLoggedIn ? 'disabled' : ''}`}
                  onClick={() => handleRegisterClick(activity)}
                  disabled={!isLoggedIn || isActivityRegistered(activity.id)}
                >
                  {!isLoggedIn ? 'Connexion requise' : 
                   isActivityRegistered(activity.id) ? 'Inscrit ✓' : 'S\'inscrire'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de confirmation d'inscription */}
      {showConfirmModal && selectedActivity && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Confirmer votre inscription</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="confirm-modal-body">
              <div className="activity-summary">
                <div className="activity-icon">{selectedActivity.image}</div>
                <div className="activity-info">
                  <h4>{selectedActivity.title}</h4>
                  <p><strong>📍 Lieu :</strong> {selectedActivity.location}</p>
                  <p><strong>📅 Date :</strong> {selectedActivity.date}</p>
                  <p><strong>🕐 Heure :</strong> {selectedActivity.time}</p>
                </div>
              </div>
              
              <div className="confirmation-message">
                <p>Êtes-vous sûr de vouloir vous inscrire à cette activité ?</p>
                <p><small>L'événement sera automatiquement ajouté à votre agenda personnel.</small></p>
              </div>
            </div>

            <div className="confirm-modal-actions">
              <button 
                className="btn-cancel-registration"
                onClick={() => setShowConfirmModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn-confirm-registration"
                onClick={confirmRegistration}
              >
                Confirmer l'inscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;