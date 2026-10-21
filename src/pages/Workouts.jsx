import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { generateWorkoutPlan } from '../utils/workoutGenerator';
import Card from '../components/Card';
import Button from '../components/Button';
import { ChevronLeft, Play, CheckCircle, Circle, ChevronUp, AlertCircle } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Workouts.css';

const Workouts = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [plan, setPlan] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [completedExercises, setCompletedExercises] = useState({});
  const [expandedGif, setExpandedGif] = useState({});
  const [weights, setWeights] = useState({});
  const [overloadSuggestions, setOverloadSuggestions] = useState({});

  useEffect(() => {
    if (user) {
      const generatedPlan = generateWorkoutPlan(user.goal, user.daysPerWeek, user.locationPref, user.experienceLevel);
      setPlan(generatedPlan);
      
      const today = new Date().getDay();
      const dayIndex = today === 0 ? 6 : today - 1;
      setSelectedDay(dayIndex);

      const savedProgress = JSON.parse(localStorage.getItem(`aurafit_workouts_${user.email}`) || '{}');
      setCompletedExercises(savedProgress);

      const savedWeights = JSON.parse(localStorage.getItem(`aurafit_weights_${user.email}`) || '{}');
      setWeights(savedWeights);

      const logs = JSON.parse(localStorage.getItem(`aurafit_workout_logs_${user.email}`) || '[]');
      const suggestions = {};
      
      generatedPlan[dayIndex]?.routine?.forEach(ex => {
        const pastLogs = logs.filter(l => l.exerciseName === ex.name);
        if (pastLogs.length > 0) {
          const lastWeight = pastLogs[pastLogs.length - 1].weight;
          if (lastWeight > 0) {
            suggestions[ex.name] = `You've lifted ${lastWeight}kg consistently. Try adding 2.5kg today!`;
          }
        }
      });
      setOverloadSuggestions(suggestions);
    }
  }, [user]);

  const toggleExercise = (dayIdx, exIdx, exerciseName) => {
    const key = `${dayIdx}-${exIdx}`;
    const isNowCompleted = !completedExercises[key];
    
    const updated = {
      ...completedExercises,
      [key]: isNowCompleted
    };
    setCompletedExercises(updated);
    localStorage.setItem(`aurafit_workouts_${user.email}`, JSON.stringify(updated));

    if (isNowCompleted) {
      const currentWeight = weights[key] || 0;
      const logs = JSON.parse(localStorage.getItem(`aurafit_workout_logs_${user.email}`) || '[]');
      logs.push({
        date: new Date().toISOString(),
        exerciseName,
        weight: Number(currentWeight)
      });
      localStorage.setItem(`aurafit_workout_logs_${user.email}`, JSON.stringify(logs));
    }
  };

  const handleWeightChange = (dayIdx, exIdx, val) => {
    const key = `${dayIdx}-${exIdx}`;
    const updated = { ...weights, [key]: val };
    setWeights(updated);
    localStorage.setItem(`aurafit_weights_${user.email}`, JSON.stringify(updated));
  };

  const toggleGif = (idx) => {
    setExpandedGif(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!plan.length) return null;

  const currentRoutine = plan[selectedDay];

  return (
    <div className="workouts-container animate-fade-in">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <ChevronLeft size={24} />
        </button>
        <h2>{t('workoutArchitect')}</h2>
        <LanguageSwitcher />
      </header>

      <div className="calendar-strip mb-6">
        {plan.map((day, idx) => (
          <div 
            key={idx} 
            className={`calendar-day ${selectedDay === idx ? 'active' : ''} ${day.isRestDay ? 'rest' : ''}`}
            onClick={() => setSelectedDay(idx)}
          >
            <span className="day-name">{day.dayName}</span>
            <div className={`day-indicator ${day.isRestDay ? 'rest-dot' : 'workout-dot'}`}></div>
          </div>
        ))}
      </div>



      <div className="routine-view">
        <div className="flex justify-between items-end mb-4">
          <h3>{currentRoutine.isRestDay ? t('restDay') : t('todaysRoutine')}</h3>
          {!currentRoutine.isRestDay && <span className="text-primary text-sm font-semibold">{currentRoutine.type}</span>}
        </div>
        
        {currentRoutine.isRestDay ? (
          <Card className="rest-card">
            <p>{t('restCard')}</p>
          </Card>
        ) : (
          <div className="exercise-list">
            {currentRoutine.routine.map((ex, idx) => {
              const key = `${selectedDay}-${idx}`;
              const isDone = completedExercises[key];
              const isGifOpen = expandedGif[idx];
              const overloadTip = overloadSuggestions[ex.name];

              return (
                <Card key={idx} className={`exercise-card ${isDone ? 'completed' : ''}`}>
                  <div className="exercise-header">
                    <div className="flex items-start gap-4">
                      {ex.muscleImg && (
                        <div className="muscle-img-container flex-shrink-0">
                          <img src={ex.muscleImg} alt="Target Muscle" className="w-24 h-24 object-cover rounded-lg border-2 border-[var(--border-color)] shadow-lg" />
                        </div>
                      )}
                      <button onClick={() => toggleExercise(selectedDay, idx, ex.name)} className="toggle-btn mt-1">
                        {isDone ? <CheckCircle color="var(--primary)" /> : <Circle color="var(--text-secondary)" />}
                      </button>
                      <div className="flex-1">
                        <h4 className={isDone ? 'text-strikethrough' : ''}>{t(ex.name)}</h4>
                        <div className="flex gap-2">
                          <span className="equipment-tag">{t(ex.equipment)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="exercise-details">
                    {overloadTip && !isDone && (
                      <div className="overload-tip">
                        <AlertCircle size={14} />
                        <span>{overloadTip}</span>
                      </div>
                    )}

                    <div className="sets-reps-weight">
                      <div className="flex gap-4">
                        <div className="stat"><span>{t('sets')}</span><strong>{ex.sets}</strong></div>
                        <div className="stat"><span>{t('reps')}</span><strong>{ex.reps}</strong></div>
                        <div className="stat"><span>{t('rest')}</span><strong>{ex.rest}</strong></div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="video-btn"
                      onClick={() => toggleGif(idx)}
                    >
                      {isGifOpen ? <ChevronUp size={16} className="mr-2" /> : <Play size={16} className="mr-2" />} 
                      {isGifOpen ? t('hideTechnique') : t('watchTechnique')}
                    </Button>

                    {isGifOpen && (
                      <div className="gif-container mt-4 animate-fade-in">
                        <img src={ex.gifUrl} alt={`${ex.name} technique`} className="technique-gif" />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Workouts;
