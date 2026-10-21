import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { calculateMacros } from '../utils/calculations';
import { generateWorkoutPlan } from '../utils/workoutGenerator';
import Card from '../components/Card';
import { Apple, Dumbbell, LogOut, Flame, CheckCircle, Activity } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [consumed, setConsumed] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [workoutProgress, setWorkoutProgress] = useState({ completed: 0, total: 0 });

  const macros = useMemo(() => {
    if (!user) return null;
    return calculateMacros(
      Number(user.weight), 
      Number(user.height), 
      Number(user.age), 
      user.gender, 
      user.goal, 
      user.activityLevel,
      user.diet
    );
  }, [user]);

  const plan = useMemo(() => {
    if (!user) return null;
    return generateWorkoutPlan(user.goal, user.daysPerWeek, user.locationPref);
  }, [user]);

  useEffect(() => {
    if (user) {
      const logs = JSON.parse(localStorage.getItem(`aurafit_daily_logs_${user.email}`) || '[]');
      const today = new Date().toDateString();
      const todaysLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);
      
      const total = todaysLogs.reduce((acc, log) => {
        acc.calories += (log.macros.protein * 4) + (log.macros.carbs * 4) + (log.macros.fats * 9);
        acc.protein += log.macros.protein;
        acc.carbs += log.macros.carbs;
        acc.fats += log.macros.fats;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
      setConsumed(total);

      if (plan) {
        const dayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
        const todaysRoutine = plan[dayIndex];
        
        if (!todaysRoutine.isRestDay) {
          const savedProgress = JSON.parse(localStorage.getItem(`aurafit_workouts_${user.email}`) || '{}');
          const completed = todaysRoutine.routine.filter((_, idx) => savedProgress[`${dayIndex}-${idx}`]).length;
          setWorkoutProgress({ completed, total: todaysRoutine.routine.length, isRest: false });
        } else {
          setWorkoutProgress({ completed: 0, total: 0, isRest: true });
        }
      }
    }
  }, [user, plan]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || !macros || !plan) return <div>{t('loading')}</div>;

  const currentRoutine = plan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header">
        <div>
          <p className="text-secondary text-sm font-medium tracking-wider uppercase mb-1">
            {t('welcome')}
          </p>
          <h1 className="text-3xl m-0">{user.name || 'Athlete'}</h1>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="section-title">
        <h2>{t('plan')}</h2>
        <span className="text-secondary text-sm">{user.goal || 'Bulk'}</span>
      </div>

      <div className="dashboard-content">
        <div className="flex gap-4 mb-4">
          <Card className="profile-card flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center gap-2 m-0 text-lg">
                <Activity size={20} className="text-primary" />
                {t('metabolism')}
              </h3>
              <span className="badge badge-primary">{macros.tdee} kcal</span>
            </div>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">{t('bmr')}</span>
                <span className="metric-value">{macros.bmr}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">{t('neat')}</span>
                <span className="metric-value">{macros.neat}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">{t('activeTarget')}</span>
                <span className="metric-value">{macros.workoutBurn}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="section-title">
          <h2>{t('todaysWorkout')}</h2>
        </div>

        <Card className="mb-8" style={{ background: 'var(--card-bg-light)', borderLeft: '4px solid var(--primary)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0 text-lg">{currentRoutine.isRestDay ? t('restDay') : currentRoutine.focus}</h3>
            {!currentRoutine.isRestDay && <Flame size={20} className="text-primary" />}
          </div>
          {!currentRoutine.isRestDay ? (
            <div>
              <div className="text-sm text-secondary mb-3">
                {t('movesCompleted')}: <span className="text-white font-medium">{workoutProgress.completed} / {workoutProgress.total}</span>
              </div>
              <div className="flex flex-col gap-2">
                {currentRoutine.routine.slice(0, 3).map((ex, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm p-3 rounded" style={{background: 'var(--bg-surface)', border: '1px solid var(--border-color)'}}>
                    <span className="font-medium">{t(ex.name)}</span>
                    <span className="text-primary text-xs font-bold">{ex.sets}x{ex.reps}</span>
                  </div>
                ))}
                {currentRoutine.routine.length > 3 && (
                  <div className="text-center text-xs text-secondary mt-1">+{currentRoutine.routine.length - 3} {t('moreExercises') || 'more'}</div>
                )}
              </div>
              <button 
                className="w-full mt-4 py-3 rounded-full font-semibold transition-all hover:opacity-90"
                style={{background: 'var(--primary)', color: '#000'}}
                onClick={() => navigate('/workouts')}
              >
                {t('startWorkout') || 'Start Workout'}
              </button>
            </div>
          ) : (
            <div className="text-sm text-secondary">{t('restCard')}</div>
          )}
        </Card>

        <div className="section-title">
          <h2>{t('calsRemaining')}</h2>
        </div>

        <Card className="macro-card card-elevated">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="live-balance">{Math.round(Math.max(0, macros.calories - consumed.calories))}</h2>
              <span className="text-secondary text-sm">{t('calsRemaining')}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{Math.round(consumed.calories)} / {macros.calories}</div>
              <span className="text-secondary text-sm">{t('consumed')}</span>
            </div>
          </div>
          
          <div className="macros-grid">
            <div className="macro-item">
              <div className="macro-label">{t('protein')}</div>
              <div className="macro-bar"><div className="macro-fill" style={{width: `${Math.min(100, (consumed.protein/macros.protein)*100)}%`}}></div></div>
              <div className="macro-value">{Math.round(consumed.protein)} / {macros.protein}g</div>
            </div>
            <div className="macro-item">
              <div className="macro-label">{t('carbs')}</div>
              <div className="macro-bar"><div className="macro-fill" style={{width: `${Math.min(100, (consumed.carbs/macros.carbs)*100)}%`}}></div></div>
              <div className="macro-value">{Math.round(consumed.carbs)} / {macros.carbs}g</div>
            </div>
            <div className="macro-item">
              <div className="macro-label">{t('fats')}</div>
              <div className="macro-bar"><div className="macro-fill" style={{width: `${Math.min(100, (consumed.fats/macros.fats)*100)}%`}}></div></div>
              <div className="macro-value">{Math.round(consumed.fats)} / {macros.fats}g</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
