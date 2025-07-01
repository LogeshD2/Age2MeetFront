// ===== DÉFINITIONS DES CONSTANTES D'ABORD =====
const API_BASE_URL = 'https://age2meet.onrender.com/api';
const MEDIA_BASE_URL = 'https://age2meet.onrender.com';

// ===== FONCTION buildImageUrl CORRIGÉE =====
export const buildImageUrl = (imagePath) => {
  console.log('🔍 buildImageUrl appelé avec:', imagePath);
  
  if (!imagePath) {
    console.log('🔍 Pas d\'image path, retour null');
    return null;
  }
  
  // Si l'URL est déjà complète
  if (imagePath.startsWith('http')) {
    console.log('🔍 URL complète détectée:', imagePath);
    // Ajouter un timestamp pour éviter le cache
    const separator = imagePath.includes('?') ? '&' : '?';
    const finalUrl = `${imagePath}${separator}t=${Date.now()}`;
    console.log('🔍 URL finale avec timestamp:', finalUrl);
    return finalUrl;
  }
  
  let finalUrl;
  
  // Si le chemin commence par /media/
  if (imagePath.startsWith('/media/')) {
    finalUrl = `${MEDIA_BASE_URL}${imagePath}`;
  } else {
    // Sinon, ajouter /media/ au début
    finalUrl = `${MEDIA_BASE_URL}/media/${imagePath}`;
  }
  
  // Ajouter timestamp pour éviter le cache
  const separator = finalUrl.includes('?') ? '&' : '?';
  finalUrl = `${finalUrl}${separator}t=${Date.now()}`;
  
  console.log('🔍 URL finale construite:', finalUrl);
  return finalUrl;
};

// ===== FONCTION handleUnauthorized =====
const handleUnauthorized = () => {
  console.log('❌ Token invalide ou expiré - déconnexion automatique');
  
  // Supprimer toutes les données de session
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  
  // Rediriger vers la page de connexion
  window.location.href = '/login';
};

// ===== FONCTION apiRequest =====
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  // Debug: afficher le token utilisé
  console.log('🔑 Token utilisé:', token ? `${token.substring(0, 10)}...` : 'AUCUN TOKEN');
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Token ${token}` : '',
        ...options.headers,
      },
      ...options,
    });
    
    // Gestion spécifique de l'erreur 401
    if (response.status === 401) {
      console.error('❌ Erreur 401: Token non autorisé');
      
      // Si c'est une tentative de connexion qui échoue, ne pas déconnecter
      if (endpoint.includes('/auth/login/')) {
        const data = await response.json();
        throw new Error(data.error || 'Email ou mot de passe incorrect');
      }
      
      // Pour toutes les autres requêtes, déconnecter l'utilisateur
      handleUnauthorized();
      throw new Error('Session expirée, veuillez vous reconnecter');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('🚨 API Error:', error);
    throw error;
  }
};

// ===== SERVICES D'AUTHENTIFICATION =====
export const authService = {
  register: async (userData) => {
    return await apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  login: async (email, password) => {
    return await apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  logout: async () => {
    try {
      await apiRequest('/auth/logout/', {
        method: 'POST',
      });
    } catch (error) {
      console.log('Erreur lors de la déconnexion côté serveur, déconnexion locale uniquement');
    } finally {
      // Toujours nettoyer les données locales
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
    }
  }
};

// ===== SERVICES POUR LES CONTACTS =====
export const contactService = {
  getMyContacts: async () => {
    return await apiRequest('/contacts/');
  },
  
  sendFriendRequest: async (contactId) => {
    return await apiRequest('/contacts/', {
      method: 'POST',
      body: JSON.stringify({ contact_id: contactId }),
    });
  },
  
  respondToFriendRequest: async (contactId, action) => {
    return await apiRequest(`/contacts/${contactId}/action/`, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    });
  },
  
  removeContact: async (contactId) => {
    return await apiRequest(`/contacts/${contactId}/`, {
      method: 'DELETE',
    });
  }
};

// ===== SERVICES POUR LES UTILISATEURS =====
export const userService = {
  getAllUsers: async () => {
    return await apiRequest('/home/');
  }
};

// ===== SERVICES POUR LA MESSAGERIE =====
export const messageService = {
  getMessages: async (userId) => {
    return await apiRequest(`/messages/?user_id=${userId}`);
  },
  
  sendMessage: async (receiverId, content) => {
    return await apiRequest('/messages/', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, content }),
    });
  }
};

// ===== SERVICES POUR LE PROFIL UTILISATEUR =====
export const profileService = {
  getProfile: async () => {
    return await apiRequest('/profile/');
  },
  
  updateProfile: async (profileData) => {
    return await apiRequest('/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  
  uploadProfilePhoto: async (imageFile) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }
    
    console.log('📤 Upload de la photo:', imageFile.name, imageFile.type);
    
    const formData = new FormData();
    formData.append('profile_picture', imageFile);
    
    // Log du contenu du FormData pour debug
    for (let pair of formData.entries()) {
      console.log('📤 FormData:', pair[0], pair[1]);
    }
    
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Token ${token}`,
        // Ne PAS définir Content-Type pour FormData, le navigateur le fait automatiquement
      },
      body: formData,
    });
    
    console.log('📡 Réponse serveur status:', response.status);
    
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Session expirée, veuillez vous reconnecter');
    }
    
    const data = await response.json();
    console.log('📦 Données reçues du serveur:', data);
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }
};
