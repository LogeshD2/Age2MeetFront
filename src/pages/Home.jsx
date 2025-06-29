// src/pages/Home.jsx
import ActivitiesPage from '../components/Home/Activite/Activities';
import HeroSection from '../components/Home/HeroSection/HeroSection';
import ProfileCards from '../components/Home/ProfilCards/ProfileCards';
import VideoTutorial from '../components/Home/VideoTutorial/VideoTutorial';

const Home = () => {
  return (
    <div>
      <HeroSection />
      <ActivitiesPage/>
      <VideoTutorial/>
      <ProfileCards/>
    </div>
  );
};

export default Home;
