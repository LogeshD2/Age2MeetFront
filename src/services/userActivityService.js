// Service centralisé pour gérer les inscriptions aux activités par utilisateur
class UserActivityService {
  constructor() {
    this.storageKey = 'userActivities';
  }

  // Obtenir l'ID de l'utilisateur connecté
  getCurrentUserId() {
    return localStorage.getItem('userId');
  }

  // Obtenir le nom d'utilisateur connecté
  getCurrentUsername() {
    return localStorage.getItem('username');
  }

  // Vérifier si l'utilisateur est connecté
  isUserLoggedIn() {
    return !!this.getCurrentUserId();
  }

  // Obtenir les données de tous les utilisateurs
  getAllUserData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  // Obtenir les inscriptions de l'utilisateur actuel
  getCurrentUserRegistrations() {
    if (!this.isUserLoggedIn()) {
      return [];
    }
    
    const userId = this.getCurrentUserId();
    const allData = this.getAllUserData();
    return allData[userId]?.registeredActivities || [];
  }

  // Obtenir les événements agenda de l'utilisateur actuel
  getCurrentUserEvents() {
    if (!this.isUserLoggedIn()) {
      return [];
    }
    
    const userId = this.getCurrentUserId();
    const allData = this.getAllUserData();
    return allData[userId]?.agendaEvents || [];
  }

  // Sauvegarder les données d'un utilisateur
  saveUserData(userId, registeredActivities, agendaEvents) {
    const allData = this.getAllUserData();
    
    if (!allData[userId]) {
      allData[userId] = {};
    }
    
    allData[userId].registeredActivities = registeredActivities;
    allData[userId].agendaEvents = agendaEvents;
    
    localStorage.setItem(this.storageKey, JSON.stringify(allData));
    
    // Déclencher un événement pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('userActivitiesUpdated', {
      detail: { userId, registeredActivities, agendaEvents }
    }));
  }

  // Inscrire l'utilisateur à une activité
  registerToActivity(activity) {
    if (!this.isUserLoggedIn()) {
      throw new Error('Vous devez être connecté pour vous inscrire à une activité');
    }

    const userId = this.getCurrentUserId();
    const currentRegistrations = this.getCurrentUserRegistrations();
    const currentEvents = this.getCurrentUserEvents();

    // Vérifier si déjà inscrit
    if (currentRegistrations.includes(activity.id)) {
      throw new Error('Vous êtes déjà inscrit à cette activité');
    }

    // Ajouter l'inscription
    const newRegistrations = [...currentRegistrations, activity.id];

    // Créer l'événement pour l'agenda
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

    const newEvents = [...currentEvents, newEvent];

    // Sauvegarder
    this.saveUserData(userId, newRegistrations, newEvents);

    console.log(`✅ Utilisateur ${userId} inscrit à l'activité ${activity.title}`);
    return newEvent;
  }

  // Désinscrire l'utilisateur d'une activité
  unregisterFromActivity(activityId, activityTitle = null) {
    if (!this.isUserLoggedIn()) {
      return false;
    }

    const userId = this.getCurrentUserId();
    const currentRegistrations = this.getCurrentUserRegistrations();
    const currentEvents = this.getCurrentUserEvents();

    // Retirer l'inscription
    const newRegistrations = currentRegistrations.filter(id => id !== activityId);

    // Retirer l'événement de l'agenda (par activityId ou titre)
    const newEvents = currentEvents.filter(event => {
      if (event.activityId) {
        return event.activityId !== activityId;
      }
      if (activityTitle) {
        const eventTitle = event.title.replace('🎯 ', '');
        return eventTitle !== activityTitle;
      }
      return true;
    });

    // Sauvegarder
    this.saveUserData(userId, newRegistrations, newEvents);

    console.log(`❌ Utilisateur ${userId} désinscrit de l'activité ${activityId}`);
    return true;
  }

  // Vérifier si l'utilisateur est inscrit à une activité
  isRegisteredToActivity(activityId) {
    if (!this.isUserLoggedIn()) {
      return false;
    }
    
    const registrations = this.getCurrentUserRegistrations();
    return registrations.includes(activityId);
  }

  // Nettoyer les données lors de la déconnexion
  clearCurrentUserData() {
    // On ne supprime pas les données, on les garde pour la reconnexion
    console.log('Données utilisateur conservées pour la reconnexion');
  }

  // Migrer les anciennes données (si nécessaire)
  migrateOldData() {
    const oldRegistrations = localStorage.getItem('registeredActivities');
    const oldEvents = localStorage.getItem('agendaEvents');
    
    if (oldRegistrations || oldEvents) {
      const userId = this.getCurrentUserId();
      if (userId) {
        const registrations = oldRegistrations ? JSON.parse(oldRegistrations) : [];
        const events = oldEvents ? JSON.parse(oldEvents) : [];
        
        this.saveUserData(userId, registrations, events);
        
        // Supprimer les anciennes données
        localStorage.removeItem('registeredActivities');
        localStorage.removeItem('agendaEvents');
        
        console.log('Migration des anciennes données terminée');
      }
    }
  }
}

// Instance unique du service
export const userActivityService = new UserActivityService();
export default userActivityService; 