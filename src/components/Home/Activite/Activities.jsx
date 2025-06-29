import React from 'react';
import './Activities.css';

const ActivitiesPage = () => {
  const activities = [
    {
      id: 1,
      title: "Atelier Cuisine Intergénérationnel - Paris 14e",
      location: "Maison des associations, Paris 14e",
      date: "Mardi 9 juillet 2025",
      time: "14h30 – 16h30",
      description: "Apprendre à cuisiner ensemble des recettes traditionnelles françaises dans une ambiance conviviale. Moment de transmission, de partage et de dégustation.",
      image: "🍅👵👴🍳"
    },
    {
      id: 2,
      title: "Balade culturelle au Parc de Sceaux",
      location: "Domaine de Sceaux (RER B)",
      date: "Jeudi 11 juillet 2025",
      time: "10h – 12h",
      description: "Promenade guidée à travers les jardins d'André Le Nôtre, découverte de l'histoire du château, temps calme autour du bassin.",
      image: "🏰🌳👵👴🚶‍♀️"
    },
    {
      id: 3,
      title: "Café-lecture \"Souvenirs et Saisons\" – Vincennes",
      location: "Domaine de Sceaux (RER B)",
      date: "Vendredi 12 juillet 2025",
      time: "10h – 12h",
      description: "Rencontre autour d'extraits littéraires et de souvenirs partagés. Thème du mois : les saisons de la vie. Boissons chaudes offertes, lecture à voix haute par un bibliothécaire.",
      image: "📚☕👵👴📖"
    }
  ];

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
                
                <button className="register-button">
                  S'inscrire
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;