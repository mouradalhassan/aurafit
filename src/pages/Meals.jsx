import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getMealRecommendations, calculateMacros, getFullRecipeDatabase } from '../utils/calculations';
import Card from '../components/Card';
import Button from '../components/Button';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Meals.css';

const Meals = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [consumed, setConsumed] = useState({ calories: 0, protein: 0 });

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

  const updateConsumed = () => {
    if (!user) return;
    const allLogs = JSON.parse(localStorage.getItem(`aurafit_daily_logs_${user.email}`) || '[]');
    const today = new Date().toDateString();
    const todaysLogs = allLogs.filter(log => new Date(log.timestamp).toDateString() === today);
    
    let totalCals = 0;
    let totalPro = 0;
    todaysLogs.forEach(log => {
      totalCals += (log.macros.protein * 4) + (log.macros.carbs * 4) + (log.macros.fats * 9);
      totalPro += log.macros.protein;
    });
    setConsumed({ calories: totalCals, protein: totalPro });
  };

  const recalibrateMeals = (meals, targetCalories, targetProtein) => {
    if (!meals || meals.length === 0) return meals;
    
    let currentProtein = meals.reduce((sum, m) => sum + m.protein, 0);
    const pRatio = currentProtein > 0 ? targetProtein / currentProtein : 1;
    
    let adjustedMeals = meals.map(m => ({
      ...m,
      protein: Math.round(m.protein * pRatio)
    }));
    
    const newProteinCals = adjustedMeals.reduce((sum, m) => sum + (m.protein * 4), 0);
    const neededNonProteinCals = Math.max(0, targetCalories - newProteinCals);
    
    const currentNonProteinCals = adjustedMeals.reduce((sum, m) => sum + (m.carbs * 4) + (m.fats * 9), 0);
    const nonPRatio = currentNonProteinCals > 0 ? neededNonProteinCals / currentNonProteinCals : 1;
    
    adjustedMeals = adjustedMeals.map(m => ({
      ...m,
      carbs: Math.round(m.carbs * nonPRatio),
      fats: Math.round(m.fats * nonPRatio)
    }));

    const finalCals = adjustedMeals.reduce((sum, m) => sum + (m.protein * 4) + (m.carbs * 4) + (m.fats * 9), 0);
    const finalProtein = adjustedMeals.reduce((sum, m) => sum + m.protein, 0);
    
    let pDiff = targetProtein - finalProtein;
    let cDiff = targetCalories - finalCals;
    
    adjustedMeals[adjustedMeals.length - 1].protein = Math.max(0, adjustedMeals[adjustedMeals.length - 1].protein + pDiff);
    adjustedMeals[adjustedMeals.length - 1].carbs = Math.max(0, adjustedMeals[adjustedMeals.length - 1].carbs + Math.round(cDiff / 4));

    return adjustedMeals;
  };

  useEffect(() => {
    if (user && macros) {
      const plan = getMealRecommendations(user.country, user.diet, user.sensitivities || [], user.goal);
      setWeeklyPlan(plan);
      
      const dayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon
      const planIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      
      const recalibrated = recalibrateMeals(plan[planIndex].meals, macros.calories, macros.protein);
      setTodaysMeals(recalibrated);

      // Load image gallery logs
      const savedLogs = JSON.parse(localStorage.getItem(`aurafit_meals_${user.email}`) || '[]');
      setLogs(savedLogs);
      
      updateConsumed();
    }
  }, [user, macros]);

  const replaceMeal = (mealIndex) => {
    const db = getFullRecipeDatabase(user.country);
    const baseMeal = todaysMeals[mealIndex];
    const baseCals = (baseMeal.protein * 4) + (baseMeal.carbs * 4) + (baseMeal.fats * 9);
    
    const options = db.filter(m => {
      if (m.type !== baseMeal.type) return false;
      if (m.name === baseMeal.name) return false;
      const mCals = (m.protein * 4) + (m.carbs * 4) + (m.fats * 9);
      return Math.abs(mCals - baseCals) <= 100;
    });

    let newMeal = baseMeal;
    if (options.length > 0) {
      newMeal = options[Math.floor(Math.random() * options.length)];
    } else {
      newMeal = { ...baseMeal, name: baseMeal.name + ' (Alternative Recipe)' };
    }

    const newMeals = [...todaysMeals];
    newMeals[mealIndex] = newMeal;
    
    const recalibrated = recalibrateMeals(newMeals, macros.calories, macros.protein);
    setTodaysMeals(recalibrated);
  };

  const logMeal = (meal) => {
    const newLog = {
      id: Date.now(),
      mealName: meal.name,
      timestamp: new Date().toISOString()
    };
    
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem(`aurafit_meals_${user.email}`, JSON.stringify(updatedLogs));

    const dailyLogs = JSON.parse(localStorage.getItem(`aurafit_daily_logs_${user.email}`) || '[]');
    dailyLogs.push({
      timestamp: new Date().toISOString(),
      mealName: meal.name,
      macros: {
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats
      }
    });
    localStorage.setItem(`aurafit_daily_logs_${user.email}`, JSON.stringify(dailyLogs));
    
    updateConsumed();
  };

  return (
    <div className="meals-container animate-fade-in">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <ChevronLeft size={24} />
        </button>
        <h2>{t('nutritionMeals')}</h2>
        <LanguageSwitcher />
      </header>

      {macros && (
        <Card className="macro-taskbar-card mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h3 className="live-balance" style={{fontSize: '1.5rem', marginBottom: '4px'}}>{Math.max(0, Math.round(macros.calories - consumed.calories))}</h3>
              <span className="text-secondary text-xs font-medium uppercase tracking-wider">{t('calsRemaining')}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold" style={{color: 'var(--primary)', display: 'block', marginBottom: '4px'}}>{Math.max(0, Math.round(macros.protein - consumed.protein))}g</span>
              <span className="text-secondary text-xs font-medium uppercase tracking-wider">{t('proteinRem')}</span>
            </div>
          </div>
          
          <div className="macro-bar" style={{height: 8, background: 'var(--card-bg)', border: '1px solid var(--border-color)'}}>
            <div className="fill" style={{width: `${Math.min(100, (consumed.calories / macros.calories) * 100)}%`, background: (user.goal === 'Cut (Lose Fat)' && consumed.calories > macros.calories) ? 'red' : 'var(--primary)'}}></div>
          </div>
        </Card>
      )}

      <section className="mb-6">
        <h3 className="section-title">{t('prescribedPlan')}</h3>
        <p className="text-secondary mb-4 text-sm">{t('tapLog')}</p>
        
        <div className="meal-list">
          {todaysMeals.map((meal, idx) => {
            const isLogged = logs.some(l => 
              l.mealName === meal.name && 
              new Date(l.timestamp).toDateString() === new Date().toDateString()
            );

            return (
              <Card key={idx} className={`meal-card ${isLogged ? 'logged-card' : 'card-glass'}`}>
                <div className="meal-info">
                  <div className="flex justify-between items-center mb-1">
                    <span className="meal-type">{t(meal.type)}</span>
                    {meal.prepTime && <span className="text-xs text-secondary">{meal.prepTime}</span>}
                  </div>
                  <h4>{t(meal.name)}</h4>
                  <div className="meal-macros">
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                    <span>F: {meal.fats}g</span>
                  </div>
                  
                  {meal.ingredients && (
                    <div className="mt-3 text-sm border-t border-[var(--border-color)] pt-2">
                      <div className="font-semibold text-secondary mb-1">{t('ingredients')}</div>
                      <ul className="list-disc pl-4 mb-2 text-xs text-gray-300">
                        {meal.ingredients.map((ing, i) => <li key={i}>{t(ing)}</li>)}
                      </ul>
                      <div className="font-semibold text-secondary mb-1">{t('steps')}</div>
                      <ol className="list-decimal pl-4 text-xs text-gray-300">
                        {meal.steps.map((step, i) => <li key={i}>{t(step)}</li>)}
                      </ol>
                    </div>
                  )}
                </div>
                <div className="meal-action">
                  {isLogged ? (
                    <div className="logged-badge"><CheckCircle size={20} /> {t('logged')}</div>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary"
                        onClick={() => replaceMeal(idx)}
                        style={{padding: '0.5rem', background: 'transparent'}}
                      >
                        <span style={{fontSize: '0.8rem'}}>{t('swap')}</span>
                      </Button>
                      <Button 
                        className="log-btn"
                        onClick={() => logMeal(meal)}
                        style={{padding: '0.5rem 1rem'}}
                      >
                        <span style={{fontSize: '0.8rem'}}>{t('logMeal')}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default Meals;
