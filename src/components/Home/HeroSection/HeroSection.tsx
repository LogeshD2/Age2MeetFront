import React from 'react';
import './HeroSection.css';
import { useNavigate } from 'react-router-dom';
import HeroImage from "../../../assets/images/HeroImage.jpeg";


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
                src={HeroImage}
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