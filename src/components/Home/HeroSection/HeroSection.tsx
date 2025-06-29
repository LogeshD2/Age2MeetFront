import React from 'react';
import './HeroSection.css';
import { useNavigate } from 'react-router-dom';



const HeroSection = () => {
  const navigate = useNavigate();



  const handleInscription = () => {
    navigate('/inscription');
  };


  return (
    <div className="seniors-page">
      <div className="container">
        <div className="content-wrapper">
          <div className="text-section">
            <h1 className="main-title">
              Rencontrez,<br />
              partagez, profitez<br />
              de moments<br />
              uniques entre seniors.
            </h1>
            
            <p className="subtitle">
              Des après-midis chaleureux<br />
              et conviviaux pour créer des liens.
            </p>
            
            <div className="buttons-container">
              <button className="btn btn-primary">
                Découvrir les événements
              </button>
              <button className="btn btn-secondary" onClick={handleInscription}>
                Créer un compte
              </button>
            </div>
          </div>
          
          <div className="image-section">
            <div className="image-container">
              <img 
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Groupe de seniors heureux" 
                className="seniors-image"
              />
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;