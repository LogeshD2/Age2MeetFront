// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav>
    <Link to="/">Accueil</Link>
    <Link to="/profile">Profil</Link>
  </nav>
);

export default Navbar;
