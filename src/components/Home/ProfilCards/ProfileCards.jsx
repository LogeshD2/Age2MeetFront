// ProfileCards.jsx
import React, { useState } from 'react';
import './ProfileCards.css';

const ProfileCard = ({ profile }) => {
  const [liked, setLiked] = useState(profile.liked || false);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`star ${i >= rating ? 'empty' : ''}`}
      >
        ★
      </span>
    ));
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleMessage = () => {
    alert(`Envoyer un message à ${profile.name}`);
  };

  return (
    <div className="profile-card">
      <div className="action-buttons">
        <button 
          className={`action-btn like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          title={liked ? 'Ne plus aimer' : 'Aimer ce profil'}
        >
          ♥
        </button>
        <button 
          className="action-btn message-btn"
          onClick={handleMessage}
          title="Envoyer un message"
        >
          💬
        </button>
      </div>

      <div className="profile-header">
        <div className="profile-image-container">
          <img
            src={profile.image}
            alt={profile.name}
            className="profile-image"
          />
          {profile.online && <div className="online-indicator"></div>}
        </div>
        <div className="profile-info">
          <div className="profile-name-row">
            <h3 className="profile-name">{profile.name}</h3>
            {profile.verified && (
              <div className="verified-badge" title="Profil vérifié">
                ✓
              </div>
            )}
          </div>
          <p className="profile-age">{profile.age} ans</p>
          <div className="rating-stars">
            {renderStars(profile.rating)}
          </div>
        </div>
      </div>
      <p className="profile-description">
        {profile.description}
      </p>
    </div>
  );
};

const ProfileCards = () => {
  const profiles = [
    {
      id: 1,
      name: "Jeanne",
      age: 68,
      rating: 4,
      description: "Passionnée de jardinage et de cuisine. J'adore partager de bons moments autour d'un repas fait maison. Cherche quelqu'un avec qui explorer de nouveaux horizons.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      verified: true,
      online: true
    },
    {
      id: 2,
      name: "Henri",
      age: 74,
      rating: 4,
      description: "Ancien professeur d'histoire, j'aime les longues promenades et les discussions enrichissantes. Recherche une compagne pour partager mes passions culturelles.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      verified: false,
      online: false
    },
    {
      id: 3,
      name: "Marcel",
      age: 75,
      rating: 5,
      description: "Retraité dynamique, amateur de photographie et de voyages. Toujours prêt pour une nouvelle aventure ! Cherche une partenaire de vie pour profiter ensemble.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      verified: false,
      online: true,
      liked: true
    }
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-title">
          <div className="heart-icon">♥</div>
          <h1>Rencontres Seniors</h1>
        </div>
        <div className="user-avatar">H</div>
      </header>

      <main className="profiles-container">
        <div className="profiles-grid">
          {profiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProfileCards;