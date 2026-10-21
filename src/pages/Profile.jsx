import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { User, Calendar, LogOut, TrendingDown, Settings } from 'lucide-react';
import { calculateMacros } from '../utils/calculations';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThreeProgressRing from '../components/ThreeProgressRing';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Mocking "current" stats for the prototype
  const [currentWeight] = useState(user?.goal === 'Cut (Lose Fat)' ? user.weight - 2 : (user?.goal === 'Bulk (Gain Muscle)' ? Number(user.weight) + 1.5 : user.weight));

  const macros = useMemo(() => {
    if (!user) return null;
    return calculateMacros(
      Number(user.weight), 
      Number(user.height), 
      Number(user.age), 
      user.gender, 
      user.goal, 
      user.activityLevel,
      user.diet,
      user.dailyRoutine,
      user.bodyType
    );
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const calculateDay = () => {
    if (!user.startDate) return 1;
    const start = new Date(user.startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); 
  };

  return (
    <div className="profile-container animate-fade-in">
      <header className="profile-header text-center mb-6 relative">
        <div className="absolute top-0 right-0">
          <LanguageSwitcher />
        </div>
        <div className="avatar mb-4">
          <User size={48} color="var(--primary)" />
        </div>
        <h2>{user.name || t('athlete')}</h2>
        <p className="text-secondary">{user.email}</p>
        <div className="mt-3 inline-block px-4 py-1 rounded-full text-sm font-semibold" style={{background: 'var(--primary)', color: 'white'}}>
          {t('dayOf')} {calculateDay()} {t('ofTransformation')}
        </div>
      </header>

      <Card className="timeline-card mb-6 card-glass">
        <h3 className="mb-4">{t('timelineSub')}</h3>
        <div className="timeline-item">
          <Calendar size={20} className="timeline-icon" />
          <div className="timeline-content">
            <span className="text-sm text-secondary">{t('startDate')}</span>
            <span className="font-semibold">{new Date(user.startDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="timeline-item">
          <div className="timeline-icon plan-icon">{user.subscriptionPlan[0]}</div>
          <div className="timeline-content">
            <span className="text-sm text-secondary">{t('currentPlan')}</span>
            <span className="font-semibold text-primary">{user.subscriptionPlan}</span>
          </div>
        </div>

        {user.planExpiration && (
          <div className="timeline-item">
            <Calendar size={20} className="timeline-icon" />
            <div className="timeline-content">
              <span className="text-sm text-secondary">{t('renewsExpires')}</span>
              <span className="font-semibold">{new Date(user.planExpiration).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => navigate('/subscription')}
        >
          {t('managePlan')}
        </Button>
      </Card>

      <Card className="stats-card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3>{t('progress')}</h3>
          <TrendingDown size={20} color="var(--primary)" />
        </div>
        
        <div className="stats-grid">
          <div className="stat-compare">
            <span className="text-sm text-secondary">{t('startingWeight')}</span>
            <span className="stat-value">{user.weight} kg</span>
          </div>
          <div className="stat-compare current">
            <span className="text-sm text-primary">{t('currentWeight')}</span>
            <span className="stat-value">{currentWeight} kg</span>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <div className="relative">
            <ThreeProgressRing percentage={75} color="var(--primary)" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold">75%</span>
              <span className="text-xs text-secondary">{t('progress')}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t" style={{borderColor: 'var(--border-color)'}}>
          <span className="text-sm text-secondary">{t('goal')}: </span>
          <span className="font-semibold">{user.goal}</span>
        </div>
      </Card>

      {macros && (
        <Card className="stats-card mb-6">
          <h3 className="mb-4">{t('metabolicProfile')}</h3>
          <div className="stats-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
            <div className="stat-compare">
              <span className="text-xs text-secondary uppercase">{t('bmr')}</span>
              <span className="stat-value" style={{fontSize: '1.2rem'}}>{macros.bmr}</span>
            </div>
            <div className="stat-compare">
              <span className="text-xs text-secondary uppercase">{t('active')}</span>
              <span className="stat-value" style={{fontSize: '1.2rem'}}>{macros.workoutBurn}</span>
            </div>
            <div className="stat-compare current">
              <span className="text-xs text-primary uppercase">{t('tdee')}</span>
              <span className="stat-value" style={{fontSize: '1.2rem'}}>{macros.tdee}</span>
            </div>
          </div>
        </Card>
      )}

      <Button variant="secondary" className="w-full text-red" onClick={handleLogout}>
        <LogOut size={18} className="mr-2" /> {t('logOut')}
      </Button>
    </div>
  );
};

export default Profile;
