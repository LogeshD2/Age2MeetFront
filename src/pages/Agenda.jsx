import React, { useState, useEffect } from 'react';
import './Agenda.css';

const Agenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Service centralisé pour gérer les inscriptions par utilisateur
  const userActivityService = {
    storageKey: 'userActivities',
    
    getCurrentUserId() {
      return localStorage.getItem('userId');
    },
    
    isUserLoggedIn() {
      return !!this.getCurrentUserId();
    },
    
    getAllUserData() {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    },
    
    getCurrentUserEvents() {
      if (!this.isUserLoggedIn()) return [];
      const userId = this.getCurrentUserId();
      const allData = this.getAllUserData();
      return allData[userId]?.agendaEvents || [];
    },
    
    getCurrentUserRegistrations() {
      if (!this.isUserLoggedIn()) return [];
      const userId = this.getCurrentUserId();
      const allData = this.getAllUserData();
      return allData[userId]?.registeredActivities || [];
    },
    
    saveUserData(userId, registeredActivities, agendaEvents) {
      const allData = this.getAllUserData();
      if (!allData[userId]) allData[userId] = {};
      allData[userId].registeredActivities = registeredActivities;
      allData[userId].agendaEvents = agendaEvents;
      localStorage.setItem(this.storageKey, JSON.stringify(allData));
      
      // Déclencher les événements de mise à jour
      window.dispatchEvent(new CustomEvent('userActivitiesUpdated'));
    },
    
    unregisterFromActivity(activityId) {
      if (!this.isUserLoggedIn()) return false;
      
      const userId = this.getCurrentUserId();
      const currentRegistrations = this.getCurrentUserRegistrations();
      const currentEvents = this.getCurrentUserEvents();
      
      const newRegistrations = currentRegistrations.filter(id => id !== activityId);
      const newEvents = currentEvents.filter(event => event.activityId !== activityId);
      
      this.saveUserData(userId, newRegistrations, newEvents);
      return true;
    }
  };
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    type: 'personnel'
  });

  // Vérifier l'état de connexion et charger les données utilisateur
  useEffect(() => {
    console.log('🔄 AGENDA: useEffect principal - chargement des événements');
    
    const userId = userActivityService.getCurrentUserId();
    const loggedIn = userActivityService.isUserLoggedIn();
    
    console.log('🔄 UserId:', userId);
    console.log('🔄 LoggedIn:', loggedIn);
    
    setCurrentUserId(userId);
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      let userEvents = userActivityService.getCurrentUserEvents();
      console.log('🔄 Événements utilisateur chargés depuis userActivityService:', userEvents);
      
      // Migrer les anciennes données si nécessaire
      const oldEvents = localStorage.getItem('agendaEvents');
      if (oldEvents) {
        const oldEventsArray = JSON.parse(oldEvents);
        console.log('🔄 Migration: Anciens événements trouvés:', oldEventsArray);
        
        const currentRegistrations = userActivityService.getCurrentUserRegistrations();
        console.log('🔄 Migration: Inscriptions actuelles:', currentRegistrations);
        
        // Combiner les événements (éviter les doublons)
        const combinedEvents = [...userEvents];
        oldEventsArray.forEach(oldEvent => {
          const eventExists = combinedEvents.some(e => 
            e.activityId === oldEvent.activityId || 
            (e.date === oldEvent.date && e.title === oldEvent.title)
          );
          if (!eventExists) {
            combinedEvents.push(oldEvent);
          }
        });
        
        userActivityService.saveUserData(userId, currentRegistrations, combinedEvents);
        localStorage.removeItem('agendaEvents');
        userEvents = combinedEvents; // Utiliser les événements combinés
        console.log('🔄 Migration terminée - événements combinés:', combinedEvents);
      }
      
      console.log('🔄 Événements FINAUX à définir dans le state:', userEvents);
      setEvents(userEvents);
    } else {
      setEvents([]);
    }
    
    // Écouter les changements de connexion
    const handleStorageChange = () => {
      const newUserId = userActivityService.getCurrentUserId();
      const newLoggedIn = userActivityService.isUserLoggedIn();
      
      setCurrentUserId(newUserId);
      setIsLoggedIn(newLoggedIn);
      
      if (newLoggedIn) {
        const userEvents = userActivityService.getCurrentUserEvents();
        setEvents(userEvents);
      } else {
        setEvents([]);
      }
    };
    
    const handleAgendaUpdate = () => {
      console.log('Événement agendaUpdated reçu');
      if (userActivityService.isUserLoggedIn()) {
        const userEvents = userActivityService.getCurrentUserEvents();
        setEvents(userEvents);
        console.log('Événements mis à jour:', userEvents);
      }
    };

    // Écouter les changements de localStorage depuis d'autres onglets/pages
    window.addEventListener('storage', handleStorageChange);
    
    // Écouter l'événement personnalisé pour les mises à jour de l'agenda
    window.addEventListener('agendaUpdated', handleAgendaUpdate);
    window.addEventListener('userActivitiesUpdated', handleAgendaUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('agendaUpdated', handleAgendaUpdate);
      window.removeEventListener('userActivitiesUpdated', handleAgendaUpdate);
    };
  }, []);

  // Générer le calendrier du mois pour le mini-calendrier
  const generateMiniCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Jour de la semaine du premier jour (0=dimanche, 1=lundi, etc.)
    const firstDayOfWeek = firstDay.getDay();
    // Nombre de jours dans le mois
    const daysInMonth = lastDay.getDate();
    
    const calendarDays = [];
    
    // Ajouter les jours vides du début (pour aligner sur dimanche)
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Ajouter tous les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }
    
    return calendarDays;
  };

  // Générer le calendrier principal du mois
  const generateMainCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Jour de la semaine du premier jour (0=dimanche, 1=lundi, etc.)
    let startDay = firstDay.getDay();
    // Convertir pour que lundi = 0
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    // Nombre de jours dans le mois
    const daysInMonth = lastDay.getDate();
    
    const calendarDays = [];
    
    // Ajouter les jours du mois précédent
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = startDay - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }
    
    // Ajouter tous les jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push({
        day: day,
        isCurrentMonth: true,
        isPrevMonth: false,
        date: new Date(year, month, day)
      });
    }
    
    // Ajouter les jours du mois suivant pour compléter la grille
    const remainingSlots = 42 - calendarDays.length; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingSlots; day++) {
      calendarDays.push({
        day: day,
        isCurrentMonth: false,
        isPrevMonth: false,
        date: new Date(year, month + 1, day)
      });
    }
    
    return calendarDays;
  };

  const miniCalendarDays = generateMiniCalendarDays(currentDate);
  const mainCalendarDays = generateMainCalendarDays(currentDate);
  const currentMonth = currentDate.toLocaleDateString('fr-FR', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const selectDay = (day) => {
    if (day) {
      setSelectedDay(day);
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setCurrentDate(newDate);
    }
  };

  const handleDayClick = (dayObj) => {
    console.log('📅 === DIAGNOSTIC CLIC JOUR ===');
    console.log('📅 dayObj complet:', dayObj);
    console.log('📅 dayObj.date:', dayObj.date);
    console.log('📅 dayObj.date toString:', dayObj.date.toString());
    console.log('📅 dayObj.date toISOString:', dayObj.date.toISOString());
    console.log('📅 dayObj.date toLocaleDateString:', dayObj.date.toLocaleDateString());
    console.log('📅 Est du mois actuel:', dayObj.isCurrentMonth);
    
    if (!dayObj.isCurrentMonth) {
      // Si on clique sur un jour d'un autre mois, naviguer vers ce mois
      console.log('📅 Navigation vers autre mois');
      const newDate = new Date(dayObj.date);
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      setSelectedDay(dayObj.day);
    } else {
      // Ouvrir le modal pour ajouter un événement
      console.log('📅 Ouverture modal pour ajouter événement');
      console.log('📅 Date sélectionnée (avant conversion):', dayObj.date);
      
      // Test de différentes méthodes de conversion de date
      const method1 = dayObj.date.toISOString().split('T')[0];
      const method2 = `${dayObj.date.getFullYear()}-${String(dayObj.date.getMonth() + 1).padStart(2, '0')}-${String(dayObj.date.getDate()).padStart(2, '0')}`;
      
      console.log('📅 Méthode 1 (toISOString):', method1);
      console.log('📅 Méthode 2 (getFullYear/getMonth/getDate):', method2);
      
      const selectedSlotData = {
        day: dayObj.date,
        timeSlot: '09:00' // Heure par défaut
      };
      console.log('📅 selectedSlot créé:', selectedSlotData);
      
      setSelectedSlot(selectedSlotData);
      setShowEventModal(true);
      
      console.log('📅 === FIN DIAGNOSTIC ===');
    }
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    
    console.log('📝 === DIAGNOSTIC CRÉATION ÉVÉNEMENT ===');
    console.log('📝 Titre:', eventForm.title);
    console.log('📝 selectedSlot complet:', selectedSlot);
    console.log('📝 selectedSlot.day:', selectedSlot.day);
    console.log('📝 selectedSlot.day toString:', selectedSlot.day.toString());
    console.log('📝 selectedSlot.day toISOString:', selectedSlot.day.toISOString());
    
    if (!eventForm.title.trim()) {
      console.log('❌ Titre vide, abandon');
      return;
    }
    
    // Test de différentes méthodes de conversion de date
    const dateMethod1 = selectedSlot.day.toISOString().split('T')[0];
    const dateMethod2 = `${selectedSlot.day.getFullYear()}-${String(selectedSlot.day.getMonth() + 1).padStart(2, '0')}-${String(selectedSlot.day.getDate()).padStart(2, '0')}`;
    
    console.log('📝 Date méthode 1 (toISOString):', dateMethod1);
    console.log('📝 Date méthode 2 (getFullYear/etc):', dateMethod2);
    
    const newEvent = {
      id: Date.now() + Math.random(),
      title: eventForm.title,
      description: eventForm.description,
      type: eventForm.type,
      date: dateMethod2, // UTILISER LA MÉTHODE 2 pour éviter les problèmes de fuseau horaire
      time: selectedSlot.timeSlot,
      isActivity: false
    };
    
    console.log('📝 Nouvel événement créé:', newEvent);
    console.log('📝 Date finale de l\'événement:', newEvent.date);
    
    if (userActivityService.isUserLoggedIn()) {
      const userId = userActivityService.getCurrentUserId();
      const currentRegistrations = userActivityService.getCurrentUserRegistrations();
      const updatedEvents = [...events, newEvent];
      
      console.log('📝 Utilisateur connecté, sauvegarde avec userActivityService');
      console.log('📝 Events avant ajout:', events.length);
      console.log('📝 Events après ajout:', updatedEvents.length);
      
      // Sauvegarder dans le nouveau système
      userActivityService.saveUserData(userId, currentRegistrations, updatedEvents);
      setEvents(updatedEvents);
      
      console.log('✅ Événement sauvegardé dans userActivities');
    } else {
      console.log('📝 Utilisateur non connecté, sauvegarde en fallback');
      // Fallback pour les utilisateurs non connectés
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      localStorage.setItem('agendaEvents', JSON.stringify(updatedEvents));
      console.log('✅ Événement sauvegardé dans agendaEvents');
    }
    
    // Reset form
    setEventForm({ title: '', description: '', type: 'personnel' });
    setShowEventModal(false);
    setSelectedSlot(null);
    
    console.log('📝 Formulaire reset et modal fermé');
    console.log('📝 État events final:', events.length + 1); // +1 car setEvents est asynchrone
  };

  const getEventsForDay = (date) => {
    // Utiliser une méthode qui ignore les fuseaux horaires
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // DEBUGGING: Afficher les détails de la recherche
    if (dateStr === '2025-06-30' || dateStr === '2025-05-31') { // Dates importantes pour debug
      console.log('🔍 RECHERCHE DÉTAILLÉE pour:', dateStr);
      console.log('🔍 Tous les événements disponibles:', events);
      console.log('🔍 Recherche avec dateStr:', dateStr);
      
      events.forEach((event, index) => {
        console.log(`🔍 Événement ${index + 1}:`, {
          titre: event.title,
          date: event.date,
          dateType: typeof event.date,
          correspond: event.date === dateStr
        });
      });
    }
    
    const foundEvents = events.filter(event => event.date === dateStr);
    
    if (dateStr === '2025-06-30' || dateStr === '2025-05-31') {
      console.log('🎯 Événements trouvés pour', dateStr, ':', foundEvents);
    }
    
    return foundEvents;
  };

  const deleteEvent = (eventId) => {
    const eventToDelete = events.find(e => e.id === eventId);
    console.log('🗑️ Suppression événement:', eventToDelete);
    
    if (eventToDelete?.isActivity) {
      // Si c'est une activité Age2meet, déclencher la désinscription
      console.log('🗑️ Suppression activité depuis agenda:', eventToDelete.activityId);
      console.log('🗑️ Événement à supprimer:', eventToDelete);
      
      // NOUVEAU: Supprimer directement l'inscription du localStorage
      const userId = userActivityService.getCurrentUserId();
      if (userId) {
        // Supprimer de l'ancien système registeredActivities_${userId}
        const userKey = `registeredActivities_${userId}`;
        const currentRegistrations = JSON.parse(localStorage.getItem(userKey) || '[]');
        const newRegistrations = currentRegistrations.filter(id => id !== eventToDelete.activityId);
        localStorage.setItem(userKey, JSON.stringify(newRegistrations));
        console.log('🗑️ Inscription supprimée directement du localStorage');
        console.log('🗑️ Anciennes inscriptions:', currentRegistrations);
        console.log('🗑️ Nouvelles inscriptions:', newRegistrations);
        
        // Supprimer également du nouveau système userActivities
        const userActivities = userActivityService.getAllUserData();
        if (userActivities[userId]?.registeredActivities) {
          userActivities[userId].registeredActivities = userActivities[userId].registeredActivities.filter(id => id !== eventToDelete.activityId);
          localStorage.setItem('userActivities', JSON.stringify(userActivities));
          console.log('🗑️ Inscription supprimée du système userActivities');
        }
      }
      
      // Déclencher l'événement de désinscription avec l'ID de l'activité
      console.log('📡 Émission événement unregisterActivity avec activityId:', eventToDelete.activityId);
      
      const customEvent = new CustomEvent('unregisterActivity', {
        detail: { activityId: eventToDelete.activityId }
      });
      
      console.log('📡 Événement créé:', customEvent);
      console.log('📡 Detail de l\'événement:', customEvent.detail);
      
      window.dispatchEvent(customEvent);
      
      console.log('📡 Événement unregisterActivity émis');
      
      // Test: émettre également un événement simple pour vérifier le système
      console.log('🧪 Test: émission événement simple');
      window.dispatchEvent(new CustomEvent('testFromAgenda'));
    } else {
      // C'est un événement personnel
      console.log('🗑️ Suppression événement personnel:', eventToDelete.title);
    }
    
    const updatedEvents = events.filter(event => event.id !== eventId);
    console.log('🗑️ Events avant suppression:', events.length);
    console.log('🗑️ Events après suppression:', updatedEvents.length);
    
    setEvents(updatedEvents);
    
    // Mettre à jour également le système userActivities
    if (userActivityService.isUserLoggedIn()) {
      const userId = userActivityService.getCurrentUserId();
      const currentRegistrations = userActivityService.getCurrentUserRegistrations();
      userActivityService.saveUserData(userId, currentRegistrations, updatedEvents);
      console.log('🗑️ Événement supprimé du système userActivities');
    } else {
      // Fallback pour utilisateurs non connectés
      localStorage.setItem('agendaEvents', JSON.stringify(updatedEvents));
      console.log('🗑️ Événement supprimé de agendaEvents (fallback)');
    }
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    console.log('📋 Calcul événements à venir');
    console.log('📋 Date aujourd\'hui:', today);
    console.log('📋 Tous les événements:', events);
    
    const upcomingEvents = events
      .filter(event => {
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate >= today;
        console.log(`📋 Événement "${event.title}" (${event.date}): ${isUpcoming ? 'à venir' : 'passé'}`);
        return isUpcoming;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
    
    console.log('📋 Événements à venir filtrés:', upcomingEvents);
    return upcomingEvents;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="agenda-page">
      <div className="agenda-container">
        <div className="agenda-header">
          <h1 className="agenda-title">
            Mon <span className="agenda-highlight">Agenda</span>
          </h1>
        </div>

        <div className="agenda-content">
          <div className="agenda-sidebar">
            <div className="calendar-mini">
              <div className="calendar-header-nav">
                <button className="nav-arrow" onClick={() => navigateMonth(-1)}>‹</button>
                <h3>{currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear}</h3>
                <button className="nav-arrow" onClick={() => navigateMonth(1)}>›</button>
              </div>
              <div className="mini-calendar">
                <div className="mini-calendar-header">
                  <span>Di</span>
                  <span>Lu</span>
                  <span>Ma</span>
                  <span>Me</span>
                  <span>Je</span>
                  <span>Ve</span>
                  <span>Sa</span>
                </div>
                <div className="mini-calendar-body">
                  {miniCalendarDays.map((day, index) => (
                    <span 
                      key={index} 
                      className={day === currentDate.getDate() ? 'current-day' : ''}
                      onClick={() => selectDay(day)}
                    >
                      {day || ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="upcoming-events">
              <h3>Événements à venir</h3>
              {getUpcomingEvents().length > 0 ? (
                <div className="events-list">
                  {getUpcomingEvents().map(event => (
                    <div key={event.id} className={`upcoming-event-item ${event.isActivity ? 'activity-item' : ''}`}>
                      <div className={`event-date ${event.isActivity ? 'activity-date' : ''}`}>
                        {new Date(event.date).toLocaleDateString('fr-FR', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}
                      </div>
                      <div className="event-details">
                        <div className="event-title">
                          {event.isActivity ? '🎯 ' : ''}{event.title}
                        </div>
                        <div className="event-time">{event.time}</div>
                        {event.isActivity && (
                          <div className="event-badge">Activité Age2meet</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-events">
                  <div className="no-events-icon">🌴</div>
                  <p>No upcoming events</p>
                </div>
              )}
            </div>
          </div>

          <div className="agenda-main">
            <div className="agenda-controls">
              <div className="month-range">
                <span className="month-text">{currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear}</span>
              </div>
            </div>

            <div className="main-calendar">
              <div className="main-calendar-header">
                <div className="main-day-name">Lundi</div>
                <div className="main-day-name">Mardi</div>
                <div className="main-day-name">Mercredi</div>
                <div className="main-day-name">Jeudi</div>
                <div className="main-day-name">Vendredi</div>
                <div className="main-day-name">Samedi</div>
                <div className="main-day-name">Dimanche</div>
              </div>

              <div className="main-calendar-body">
                {mainCalendarDays.map((dayObj, index) => {
                  const dayEvents = getEventsForDay(dayObj.date);
                  return (
                    <div 
                      key={index} 
                      className={`main-calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday(dayObj.date) ? 'today' : ''}`}
                      onClick={() => handleDayClick(dayObj)}
                    >
                      <div className="day-number-main">{dayObj.day}</div>
                      <div className="day-events">
                        {dayEvents.slice(0, 3).map(event => (
                          <div 
                            key={event.id} 
                            className={`event-item event-${event.type} ${event.isActivity ? 'activity-event' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="event-title-mini">
                              {event.isActivity ? '🎯 ' : ''}{event.title}
                            </div>
                            <div className="event-time-mini">{event.time}</div>
                            <button 
                              className="delete-event-mini"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(event.id);
                              }}
                              title={event.isActivity ? "Se désinscrire de l'activité" : "Supprimer l'événement"}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="more-events">
                            +{dayEvents.length - 3} autre{dayEvents.length - 3 > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour ajouter un événement */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ajouter un événement</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowEventModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEventSubmit} className="event-form">
              <div className="form-group">
                <label>Date</label>
                <div className="datetime-display">
                  {selectedSlot && (
                    selectedSlot.day.toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="event-time">Heure</label>
                <input
                  type="time"
                  id="event-time"
                  value={selectedSlot?.timeSlot || '09:00'}
                  onChange={(e) => setSelectedSlot({...selectedSlot, timeSlot: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-title">Titre de l'événement *</label>
                <input
                  type="text"
                  id="event-title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  placeholder="Ex: Rendez-vous médecin, Déjeuner avec Marie..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-description">Description</label>
                <textarea
                  id="event-description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  placeholder="Détails supplémentaires (optionnel)"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-type">Type d'événement</label>
                <select
                  id="event-type"
                  value={eventForm.type}
                  onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                >
                  <option value="personnel">Personnel</option>
                  <option value="travail">Travail</option>
                  <option value="medical">Médical</option>
                  <option value="social">Social</option>
                  <option value="loisir">Loisir</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowEventModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-create-event"
                >
                  Créer l'événement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;