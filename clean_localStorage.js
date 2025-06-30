// Script de nettoyage pour corriger le localStorage
console.log('🧹 Début du nettoyage localStorage...');

// 1. Récupérer l'ID de l'utilisateur actuel
const currentUserId = parseInt(localStorage.getItem('userId'));
console.log('👤 ID utilisateur actuel:', currentUserId);

// 2. Nettoyer les demandes envoyées (supprimer les auto-demandes)
const sentRequests = JSON.parse(localStorage.getItem('sentRequests') || '[]');
console.log('📤 Demandes envoyées avant nettoyage:', sentRequests.length);

// Filtrer pour supprimer les auto-demandes
const cleanSentRequests = sentRequests.filter(request => {
  if (request.id === currentUserId) {
    console.log('❌ Suppression auto-demande:', request.name);
    return false;
  }
  return true;
});

console.log('📤 Demandes envoyées après nettoyage:', cleanSentRequests.length);

// 3. Sauvegarder les demandes nettoyées
localStorage.setItem('sentRequests', JSON.stringify(cleanSentRequests));

// 4. Optionnel: Nettoyer aussi les utilisateurs persistants
const persistentUsers = JSON.parse(localStorage.getItem('persistentUsers') || '[]');
console.log('👥 Utilisateurs persistants avant nettoyage:', persistentUsers.length);

const cleanPersistentUsers = persistentUsers.filter(user => {
  if (user.id === currentUserId) {
    console.log('❌ Suppression utilisateur persistant auto-référencé:', user.name);
    return false;
  }
  return true;
});

console.log('👥 Utilisateurs persistants après nettoyage:', cleanPersistentUsers.length);
localStorage.setItem('persistentUsers', JSON.stringify(cleanPersistentUsers));

console.log('✅ Nettoyage terminé ! Rechargez la page.'); 