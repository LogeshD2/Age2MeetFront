const API_BASE_URL = 'https://age2meet.onrender.com/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Token ${token}` : '',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Services d'authentification
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
    return await apiRequest('/auth/logout/', {
      method: 'POST',
    });
  }
};

// Services pour les contacts
export const contactService = {
  // Récupérer mes contacts
  getMyContacts: async () => {
    return await apiRequest('/contacts/');
  },
  
  // Envoyer une demande d'ami
  sendFriendRequest: async (contactId) => {
    return await apiRequest('/contacts/', {
      method: 'POST',
      body: JSON.stringify({ contact_id: contactId }),
    });
  },
  
  // Accepter/refuser une demande d'ami
  respondToFriendRequest: async (contactId, action) => {
    return await apiRequest(`/contacts/${contactId}/action/`, {
      method: 'PUT',
      body: JSON.stringify({ action }), // 'accept' ou 'decline'
    });
  },
  
  // Retirer/supprimer un ami
  removeContact: async (contactId) => {
    return await apiRequest(`/contacts/${contactId}/`, {
      method: 'DELETE',
    });
  }
};

// Services pour les utilisateurs
export const userService = {
  // Récupérer tous les utilisateurs (pour suggestions)
  getAllUsers: async () => {
    return await apiRequest('/home/'); // Endpoint qui retourne suggested_contacts
  }
};

// Services pour la messagerie
export const messageService = {
  // Récupérer les messages avec un utilisateur
  getMessages: async (userId) => {
    return await apiRequest(`/messages/?user_id=${userId}`);
  },
  
  // Envoyer un message
  sendMessage: async (receiverId, content) => {
    return await apiRequest('/messages/', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, content }),
    });
  }
};

// Services pour le profil utilisateur
export const profileService = {
  // Récupérer le profil de l'utilisateur connecté
  getProfile: async () => {
    return await apiRequest('/profile/');
  },
  
  // Mettre à jour le profil
  updateProfile: async (profileData) => {
    return await apiRequest('/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  
  // Upload photo de profil
  uploadProfilePhoto: async (imageFile) => {
    const token = localStorage.getItem('authToken');
    
    const formData = new FormData();
    formData.append('profile_picture', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Token ${token}` : '',
        // Ne pas spécifier Content-Type pour FormData
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }
}; 