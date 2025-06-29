// src/routes/AppRouter.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Home from '../pages/Home';
import Inscription from '../pages/Inscription';
import Profil from '../pages/Profil';
import Messagerie from '../pages/Messagerie';
import Contact from '../pages/Contact';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="inscription" element={<Inscription />} />
          <Route path="messagerie" element={<Messagerie />} />
          <Route path="agenda" element={<div>Page Mon agenda (à développer)</div>} />
          <Route path="profil" element={<Profil />} />
          <Route path="contact" element={<Contact/>} />
          <Route path="connexion" element={<div>Page Connexion (à développer)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
