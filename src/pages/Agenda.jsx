import React, { useState, useEffect } from 'react';
import './Agenda.css';

const Agenda = () => {
  const [currentDate, setCurrentDate] = useState(() => {
    // Démarrage au vrai lundi 7 juillet 2025 (le 6 juillet est un dimanche !)
    const baseDate = new Date(2025, 6, 7); // 7 juillet 2025 (lundi)
    console.log('📅 Date de base:', baseDate.toISOString().split('T')[0], baseDate.toLocaleDateString('fr-FR', { weekday: 'long' }));
    return baseDate;
  });
  const [selectedDay, setSelectedDay] = useState(7); // Jour sélectionné
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem('agendaEvents');
    return savedEvents ? JSON.parse(savedEvents) : [];
  });
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    type: 'personnel'
  });

  // Écouter les changements dans localStorage pour mettre à jour les événements
  useEffect(() => {
    const handleStorageChange = () => {
      const savedEvents = localStorage.getItem('agendaEvents');
      if (savedEvents) {
        console.log('Mise à jour des événements depuis localStorage:', savedEvents);
        setEvents(JSON.parse(savedEvents));
      }
    };

    const handleAgendaUpdate = () => {
      console.log('Événement agendaUpdated reçu');
      handleStorageChange();
    };

    // Écouter les changements de localStorage depuis d'autres onglets/pages
    window.addEventListener('storage', handleStorageChange);
    
    // Écouter l'événement personnalisé pour les mises à jour de l'agenda
    window.addEventListener('agendaUpdated', handleAgendaUpdate);
    
    // Vérifier les changements périodiquement (pour les changements dans le même onglet)
    const interval = setInterval(() => {
      const savedEvents = localStorage.getItem('agendaEvents');
      const currentEventsStr = JSON.stringify(events);
      const savedEventsStr = savedEvents || '[]';
      
      if (currentEventsStr !== savedEventsStr) {
        console.log('Changement détecté dans localStorage');
        setEvents(JSON.parse(savedEventsStr));
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('agendaUpdated', handleAgendaUpdate);
      clearInterval(interval);
    };
  }, [events]);

  // Forcer le rechargement des événements au montage du composant
  useEffect(() => {
    console.log('Agenda monté - rechargement des événements');
    const savedEvents = localStorage.getItem('agendaEvents');
    if (savedEvents) {
      console.log('Événements trouvés:', savedEvents);
      setEvents(JSON.parse(savedEvents));
    } else {
      console.log('Aucun événement trouvé dans localStorage');
    }
  }, []);

  // Générer les jours de la semaine
  const generateWeekDays = (startDate) => {
    console.log('🔧 generateWeekDays - startDate:', startDate.toISOString().split('T')[0], startDate.toLocaleDateString('fr-FR', { weekday: 'long' }));
    const days = [];
    for (let i = 0; i < 6; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      console.log(`🔧 Jour ${i}:`, day.toISOString().split('T')[0], day.toLocaleDateString('fr-FR', { weekday: 'long' }));
      days.push(day);
    }
    console.log('🔧 generateWeekDays - résultat final:', days.map(d => d.toISOString().split('T')[0]));
    return days;
  };

  // Générer le calendrier du mois
  const generateCalendarDays = (date) => {
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

  const weekDays = generateWeekDays(currentDate);
  const dayNames = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
  const calendarDays = generateCalendarDays(currentDate);
  const currentMonth = currentDate.toLocaleDateString('fr-FR', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  // Debug pour voir les jours générés avec alignment
  console.log('🗓️ Debug alignment des jours:');
  console.log('CurrentDate:', currentDate.toISOString().split('T')[0], 'Jour de la semaine:', currentDate.toLocaleDateString('fr-FR', { weekday: 'long' }));
  console.log('WeekDays générés:', weekDays.map((day, index) => ({ 
    index,
    dayName: dayNames[index],
    date: day.toISOString().split('T')[0], 
    dayOfWeek: day.toLocaleDateString('fr-FR', { weekday: 'long' }),
    dayNumber: day.getDate(),
    match: dayNames[index].toLowerCase() === day.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase()
  })));
  
  // Debug détaillé de l'alignement header vs contenu
  console.log('🔍 Alignement Header vs Contenu:');
  weekDays.forEach((day, index) => {
    console.log(`Index ${index}: Header="${dayNames[index]} ${day.getDate()}" | Jour réel="${day.toLocaleDateString('fr-FR', { weekday: 'long' })} ${day.getDate()}" | Match=${dayNames[index].toLowerCase() === day.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase()}`);
  });
  
  // Vérifier l'événement de test
  const testEvent = events.find(e => e.isActivity);
  if (testEvent) {
    console.log('🎯 Événement test trouvé:', {
      title: testEvent.title,
      date: testEvent.date,
      time: testEvent.time,
      expectedDay: new Date(testEvent.date).toLocaleDateString('fr-FR', { weekday: 'long' }),
      expectedDayNumber: new Date(testEvent.date).getDate()
    });
    
    // Vérifier dans quelle colonne il devrait apparaître
    const eventDate = new Date(testEvent.date);
    weekDays.forEach((weekDay, index) => {
      const isSameDay = weekDay.toISOString().split('T')[0] === testEvent.date;
      console.log(`Colonne ${index} (${dayNames[index]}): ${weekDay.getDate()} juillet - Match: ${isSameDay}`);
    });
  }

  // Générer les créneaux horaires
  const timeSlots = [];
  for (let hour = 8; hour <= 23; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatWeekRange = (startDate) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 5);
    
    const start = startDate.toLocaleDateString('fr-FR', { day: '2-digit' });
    const end = endDate.toLocaleDateString('fr-FR', { day: '2-digit' });
    const month = startDate.toLocaleDateString('fr-FR', { month: 'long' });
    const year = startDate.getFullYear();
    
    return `${start}-${end} ${month} ${year}`;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const selectDay = (day) => {
    if (day) {
      setSelectedDay(day);
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      // Trouver le lundi de cette semaine pour mettre à jour la vue hebdomadaire
      const dayOfWeek = newDate.getDay(); // 0 = dimanche, 1 = lundi, etc.
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, reculer de 6 jours
      const monday = new Date(newDate);
      monday.setDate(newDate.getDate() + mondayOffset);
      
      setCurrentDate(monday);
    }
  };

  const handleCellClick = (day, timeSlot) => {
    setSelectedSlot({ day, timeSlot });
    setShowEventModal(true);
    setEventForm({ title: '', description: '', type: 'personnel' });
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    const newEvent = {
      id: Date.now(),
      title: eventForm.title,
      description: eventForm.description,
      type: eventForm.type,
      date: selectedSlot.day.toISOString().split('T')[0],
      time: selectedSlot.timeSlot,
      day: selectedSlot.day.getDate(),
      month: selectedSlot.day.getMonth(),
      year: selectedSlot.day.getFullYear()
    };

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem('agendaEvents', JSON.stringify(updatedEvents));
    
    setShowEventModal(false);
    setSelectedSlot(null);
    setEventForm({ title: '', description: '', type: 'personnel' });
  };

  const getEventsForDayAndTime = (day, timeSlot) => {
    const dayString = day.toISOString().split('T')[0];
    
    // Extraire l'heure du créneau (ex: "14:00" -> 14)
    const slotHour = parseInt(timeSlot.split(':')[0]);
    
    const filtered = events.filter(event => {
      if (event.date !== dayString) return false;
      
      // Extraire l'heure de l'événement (ex: "14:30" -> 14)
      const eventHour = parseInt(event.time.split(':')[0]);
      
      // L'événement appartient à ce créneau s'il commence dans cette heure
      return eventHour === slotHour;
    });
    
    // Debug étendu pour comprendre le problème
    console.log(`🔍 Recherche événements pour ${dayString} à ${timeSlot} (heure ${slotHour})`);
    console.log(`📅 Jour recherché: ${dayString}`);
    console.log(`⏰ Heure recherchée: ${timeSlot} (heure: ${slotHour})`);
    console.log(`📋 Tous les événements disponibles:`, events.map(e => ({
      title: e.title,
      date: e.date,
      time: e.time,
      eventHour: e.time ? parseInt(e.time.split(':')[0]) : null,
      isActivity: e.isActivity
    })));
    console.log(`✅ Événements filtrés:`, filtered);
    
    if (filtered.length > 0) {
      console.log(`✨ Événement trouvé pour ${dayString} à ${timeSlot}:`, filtered);
    } else {
      console.log(`❌ Aucun événement trouvé pour ${dayString} à ${timeSlot}`);
      // Vérifier s'il y a des événements pour cette date mais à d'autres heures
      const eventsForDay = events.filter(event => event.date === dayString);
      if (eventsForDay.length > 0) {
        console.log(`⚠️ Événements trouvés pour ${dayString} mais à d'autres heures:`, eventsForDay.map(e => ({
          title: e.title,
          time: e.time,
          hour: e.time ? parseInt(e.time.split(':')[0]) : null
        })));
      }
    }
    
    return filtered;
  };

  const deleteEvent = (eventId) => {
    const eventToDelete = events.find(event => event.id === eventId);
    
    // Si c'est une activité, la retirer aussi des inscriptions
    if (eventToDelete && eventToDelete.isActivity) {
      const registeredActivities = JSON.parse(localStorage.getItem('registeredActivities') || '[]');
      const updatedRegistered = registeredActivities.filter(id => id !== eventToDelete.activityId);
      localStorage.setItem('registeredActivities', JSON.stringify(updatedRegistered));
    }
    
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem('agendaEvents', JSON.stringify(updatedEvents));
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5); // Augmenter pour montrer plus d'événements
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
                  {calendarDays.map((day, index) => (
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
              <div className="week-range">
                <span className="week-text">{formatWeekRange(currentDate)}</span>
                <select className="week-dropdown">
                  <option>Semaine</option>
                </select>
              </div>
            </div>

            <div className="calendar-grid">
              <div className="calendar-header">
                <div className="time-column-header"></div>
                {weekDays.map((day, index) => (
                  <div key={index} className="day-header">
                    <div className="day-name">{day.toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase()}</div>
                    <div className="day-number">{day.getDate()}</div>
                  </div>
                ))}
              </div>

              <div className="calendar-body">
                {timeSlots.map((timeSlot, timeIndex) => (
                  <div key={timeIndex} className="time-row">
                    <div className="time-label">{timeSlot}</div>
                    {weekDays.map((day, dayIndex) => {
                      const dayEvents = getEventsForDayAndTime(day, timeSlot);
                      return (
                        <div 
                          key={dayIndex} 
                          className="time-cell"
                          onClick={() => handleCellClick(day, timeSlot)}
                          title="Cliquez pour ajouter un événement"
                        >
                          {dayEvents.map(event => (
                            <div 
                              key={event.id} 
                              className={`event-block event-${event.type} ${event.isActivity ? 'activity-event' : ''}`}
                              onClick={(e) => e.stopPropagation()}
                              title={event.isActivity ? 'Activité Age2meet' : 'Événement personnel'}
                            >
                              <div className="event-title-small">
                                {event.isActivity ? '🎯 ' : ''}{event.title}
                              </div>
                              <div className="event-exact-time">
                                {event.time}
                              </div>
                              <button 
                                className="delete-event-btn"
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
                        </div>
                      );
                    })}
                  </div>
                ))}
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
                <label>Date et heure</label>
                <div className="datetime-display">
                  {selectedSlot && (
                    <>
                      {selectedSlot.day.toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} à {selectedSlot.timeSlot}
                    </>
                  )}
                </div>
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