import React, { useState } from 'react';
import './Activities.css';

const ActivitiesPage = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [registeredActivities, setRegisteredActivities] = useState(() => {
    const saved = localStorage.getItem('registeredActivities');
    return saved ? JSON.parse(saved) : [];
  });
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

  const handleRegisterClick = (activity) => {
    setSelectedActivity(activity);
    setShowConfirmModal(true);
  };

  const confirmRegistration = () => {
    if (!selectedActivity) return;

    console.log('Inscription à l\'activité:', selectedActivity.title);

    // Ajouter l'activité aux inscriptions
    const newRegisteredActivities = [...registeredActivities, selectedActivity.id];
    setRegisteredActivities(newRegisteredActivities);
    localStorage.setItem('registeredActivities', JSON.stringify(newRegisteredActivities));

    // Ajouter l'événement à l'agenda
    const existingEvents = JSON.parse(localStorage.getItem('agendaEvents') || '[]');
    const newEvent = {
      id: Date.now(),
      title: selectedActivity.title,
      description: `${selectedActivity.description}\n\nLieu: ${selectedActivity.location}`,
      type: 'social',
      date: selectedActivity.fullDate,
      time: selectedActivity.startTime,
      day: parseInt(selectedActivity.fullDate.split('-')[2]),
      month: parseInt(selectedActivity.fullDate.split('-')[1]) - 1,
      year: parseInt(selectedActivity.fullDate.split('-')[0]),
      isActivity: true,
      activityId: selectedActivity.id
    };

    const updatedEvents = [...existingEvents, newEvent];
    localStorage.setItem('agendaEvents', JSON.stringify(updatedEvents));
    
    console.log('Événement ajouté à l\'agenda:', newEvent);
    console.log('Tous les événements:', updatedEvents);

    // Déclencher un événement personnalisé pour notifier l'agenda
    window.dispatchEvent(new CustomEvent('agendaUpdated'));

    setShowConfirmModal(false);
    setSelectedActivity(null);
  };

  const isActivityRegistered = (activityId) => {
    return registeredActivities.includes(activityId);
  };

  return (
    <div className="activities-container">
      <div className="activities-card">
        <h1 className="activities-title">Activités à venir</h1>
        
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
                  className={`register-button ${isActivityRegistered(activity.id) ? 'registered' : ''}`}
                  onClick={() => handleRegisterClick(activity)}
                  disabled={isActivityRegistered(activity.id)}
                >
                  {isActivityRegistered(activity.id) ? 'Inscrit ✓' : 'S\'inscrire'}
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