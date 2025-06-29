import React from 'react';
import './VideoTutorial.css';

const VideoTutorial = () => {
  return (
    <div className="video-tutorial-container">
      <h1 className="page-title">Vidéo tutoriel</h1>
      
      <div className="video-wrapper">
        <video 
          className="video-player"
          controls
          poster="https://via.placeholder.com/600x400/4a90a4/ffffff?text=Cliquez+pour+lancer+la+vidéo"
        >
          <source 
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
            type="video/mp4"
          />
          <source 
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.webm" 
            type="video/webm"
          />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      </div>
    </div>
  );
};

export default VideoTutorial;