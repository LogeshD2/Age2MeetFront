import React, { useState, useEffect, useRef } from 'react';
import { profileService } from '../../config/api';
import './Profil.css';

const ProfileSection = () => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    pseudo: '',
    telephone: '',
    dateNaissance: '',
    biographie: '',
    location: '',
    interests: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef(null);

  // État pour le statut utilisateur
  const [userStatus, setUserStatus] = useState('en-ligne');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showInactiveNotification, setShowInactiveNotification] = useState(false);

  // Définir les différents statuts disponibles
  const statusOptions = [
    {
      key: 'online',
      label: 'En ligne',
      description: 'Montrer que vous êtes actif et disponible',
      color: '#23a55a',
      icon: '🟢'
    },
    {
      key: 'away',
      label: 'Absent',
      description: 'Automatique après 5 min d\'inactivité',
      color: '#f0b132',
      icon: '🟡'
    },
    {
      key: 'busy',
      label: 'Ne pas déranger',
      description: 'Vous préférez ne pas être dérangé',
      color: '#f23f43',
      icon: '🔴'
    },
    {
      key: 'offline',
      label: 'Hors ligne',
      description: 'Apparaître comme déconnecté',
      color: '#80848e',
      icon: '⚫'
    }
  ];

  // Charger le profil au montage du composant
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const profileData = await profileService.getProfile();
      console.log('Profil récupéré:', profileData);
      
      // Remplir le formulaire avec les données récupérées
      setFormData({
        prenom: profileData.user.first_name || '',
        nom: profileData.user.last_name || '',
        email: profileData.user.email || '',
        pseudo: profileData.user.username || '',
        telephone: profileData.user.phone || '',
        dateNaissance: profileData.user.date_of_birth || '',
        biographie: profileData.profile.bio || '',
        location: profileData.profile.location || '',
        interests: profileData.profile.interests || ''
      });
      
      // Définir la photo de profil
      setProfilePicture(profileData.profile?.profile_picture || null);
      
      // Définir le statut utilisateur
      setUserStatus(profileData.profile.status || 'online');
      
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setError('Impossible de charger votre profil. Veuillez vous reconnecter.');
    } finally {
      setLoading(false);
    }
  };

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('.status-selector')) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Réinitialiser les messages
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Préparer les données pour l'API
      const updateData = {
        first_name: formData.prenom,
        last_name: formData.nom,
        phone: formData.telephone,
        bio: formData.biographie,
        location: formData.location,
        interests: formData.interests,
        status: userStatus
      };
      
      console.log('Mise à jour du profil:', updateData);
      
      // Appeler l'API de mise à jour
      const response = await profileService.updateProfile(updateData);
      
      console.log('Profil mis à jour:', response);
      setSuccess('Profil mis à jour avec succès !');
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      setError(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (statusKey) => {
    const oldStatus = userStatus;
    setUserStatus(statusKey);
    setShowStatusDropdown(false);
    
    try {
      // Mettre à jour le statut dans la base de données
      await profileService.updateProfile({ status: statusKey });
      
      // Déclencher un événement pour mettre à jour la messagerie
      window.dispatchEvent(new CustomEvent('statusUpdated', { 
        detail: { newStatus: statusKey } 
      }));
      
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      // Revenir à l'ancien statut en cas d'erreur
      setUserStatus(oldStatus);
    }
  };

  const getCurrentStatus = () => {
    return statusOptions.find(status => status.key === userStatus) || statusOptions[0];
  };

  // Fonction pour ouvrir le sélecteur de fichier
  const handleEditPicture = () => {
    fileInputRef.current?.click();
  };

  // Fonction pour gérer l'upload de photo
  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image.');
      return;
    }

    // Vérifier la taille du fichier (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB.');
      return;
    }

    setUploadingPicture(true);
    setError('');

    try {
      console.log('Upload de l\'image:', file.name);
      const response = await profileService.uploadProfilePhoto(file);
      console.log('Image uploadée:', response);
      
      // Mettre à jour la photo de profil selon la structure de réponse
      if (response.profile && response.profile.profile_picture) {
        setProfilePicture(response.profile.profile_picture);
      } else if (response.profile_picture) {
        setProfilePicture(response.profile_picture);
      } else {
        // Recharger le profil complet pour être sûr
        await loadProfile();
      }
      
      setSuccess('Photo de profil mise à jour avec succès !');
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Erreur upload image:', error);
      setError(error.message || 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingPicture(false);
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <p style={{ textAlign: 'center', padding: '40px' }}>Chargement du profil...</p>
      </div>
    );
  }

  if (error && !formData.email) {
    return (
      <div className="profile-container">
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
          onClick={loadProfile} 
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
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">
          Mon <span className="profile-title-accent">Profil</span>
        </h1>
        
        {/* Messages d'erreur et de succès */}
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #ffcdd2'
          }}>
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div style={{
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #c8e6c9'
          }}>
            ✅ {success}
          </div>
        )}
        
        <div className="profile-image-container">
          <div className="profile-image-wrapper">
            <div className="profile-picture-container">
              {profilePicture ? (
          <img 
                  src={profilePicture.startsWith('http') ? profilePicture : `http://localhost:8000${profilePicture}`}
            alt="Photo de profil" 
                  className="profile-picture"
                />
              ) : (
                <div className="profile-avatar-large">
                  {formData.prenom ? formData.prenom.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              
              {/* Indicateur de statut */}
              <div 
                className="status-indicator" 
                style={{ backgroundColor: getCurrentStatus().color }}
                title={getCurrentStatus().label}
              ></div>
              
              {/* Bouton d'édition de la photo */}
              <button 
                className="edit-picture-btn"
                onClick={handleEditPicture}
                disabled={uploadingPicture || saving}
                title="Changer la photo de profil"
              >
                {uploadingPicture ? '⏳' : '✏️'}
              </button>
              
              {/* Input file caché */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePictureUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>
          
          {/* Affichage du pseudo sous la photo */}
          <div className="profile-username">
            @{formData.pseudo || 'utilisateur'}
          </div>
          
          {/* Sélecteur de statut */}
          <div className="status-selector">
            <button 
              className="status-button"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              disabled={saving}
            >
              <span className="status-icon">{getCurrentStatus().icon}</span>
              <span className="status-text">{getCurrentStatus().label}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showStatusDropdown && (
              <div className="status-dropdown">
                {statusOptions.map((status) => (
                  <button
                    key={status.key}
                    className={`status-option ${userStatus === status.key ? 'active' : ''}`}
                    onClick={() => handleStatusChange(status.key)}
                  >
                    <span className="status-option-icon">{status.icon}</span>
                    <div className="status-option-content">
                      <span className="status-option-text">{status.label}</span>
                      <span className="status-option-description">{status.description}</span>
                    </div>
                    {userStatus === status.key && (
                      <span className="status-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-form">
        <div className="form-group">
          <label>Prénom</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleInputChange}
            placeholder="Votre prénom"
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            placeholder="Votre nom"
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="votre.email@exemple.com"
            disabled={true} // Email non modifiable
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
        </div>

        <div className="form-group">
          <label>Pseudo</label>
          <input
            type="text"
            name="pseudo"
            value={formData.pseudo}
            onChange={handleInputChange}
            placeholder="Votre pseudo"
            disabled={true} // Pseudo non modifiable
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
        </div>

        <div className="form-group">
          <label>Téléphone</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleInputChange}
            placeholder="Votre numéro de téléphone"
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label>Localisation</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Votre ville"
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label>Centres d'intérêt</label>
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleInputChange}
            placeholder="Cuisine, Jardinage, Lecture..."
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label>Biographie</label>
          <textarea
            name="biographie"
            value={formData.biographie}
            onChange={handleInputChange}
            placeholder="Parlez-nous de vous..."
            rows="4"
            disabled={saving}
          />
        </div>

        <button 
          className="save-button" 
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Sauvegarde en cours...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSection;