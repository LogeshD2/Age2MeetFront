// src/routes/AppRouter.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Home from '../pages/Home';
import Inscription from '../pages/Inscription';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="inscription" element={<Inscription />} />
          <Route path="messagerie" element={<div>Page Messagerie (à développer)</div>} />
          <Route path="agenda" element={<div>Page Agenda (à développer)</div>} />
          <Route path="profil" element={<div>Page Profil (à développer)</div>} />
          <Route path="contact" element={<div>Page Contact (à développer)</div>} />
          <Route path="connexion" element={<div>Page Connexion (à développer)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
