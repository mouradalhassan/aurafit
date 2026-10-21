import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Apple, Dumbbell, User, CreditCard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './BottomNav.css';

const BottomNav = () => {
  const { t } = useLanguage();
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
        <Home size={24} />
        <span>{t('home')}</span>
      </NavLink>
      
      <NavLink to="/workouts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Dumbbell size={24} />
        <span>{t('workouts')}</span>
      </NavLink>
      
      <NavLink to="/meals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Apple size={24} />
        <span>{t('meals')}</span>
      </NavLink>
      
      <NavLink to="/subscription" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <CreditCard size={24} />
        <span>{t('currentPlan')}</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={24} />
        <span>{t('profile')}</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
