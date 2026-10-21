import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import './Onboarding.css';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: 'Male',
    weight: '',
    height: '',
    age: '',
    bodyFat: '',
    bodyType: 'Mesomorph',
    country: 'USA',
    activityLevel: '',
    dailyRoutine: '',
    experienceLevel: '',
    daysPerWeek: 3,
    locationPref: 'Gym',
    diet: 'None',
    sensitivities: [],
    goal: ''
  });

  const { t } = useLanguage();

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_name) {
          setFormData(f => ({ ...f, country: data.country_name }));
        }
      })
      .catch(() => {});
  }, []);
  
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = () => {
    completeOnboarding(formData);
    navigate('/');
  };

  const countries = [
    "USA", "Lebanon", "Japan", "Italy", "UK", "Canada", "Australia", "UAE", "Saudi Arabia", "Other"
  ];

  return (
    <div className="onboarding-container animate-fade-in">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(step / 5) * 100}%` }}></div>
      </div>
      
      <Card className="onboarding-card">
        {step === 1 && (
          <div className="step-content animate-fade-in">
            <h2>{t('baseline')}</h2>
            <p className="text-secondary mb-6">{t('biometricsDesc')}</p>
            
            <div className="flex gap-4 mb-4">
              {['Male', 'Female'].map(g => (
                <div 
                  key={g}
                  className={`option-card flex-1 text-center ${formData.gender === g ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, gender: g})}
                >
                  {g}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <Input 
                label={t('weightInput')} 
                type="number" 
                min="35" max="250"
                value={formData.weight} 
                onChange={(e) => setFormData({...formData, weight: e.target.value})} 
              />
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <Input 
                  label={t('heightInput')} 
                  type="number" 
                  min="130" max="215"
                  value={formData.height} 
                  onChange={(e) => setFormData({...formData, height: e.target.value})} 
                />
                <Input 
                  label={t('ageInput')} 
                  type="number" 
                  min="15" max="50"
                  value={formData.age} 
                  onChange={(e) => setFormData({...formData, age: e.target.value})} 
                />
              </div>
            </div>
            <Input 
              label={t('bodyFatInput')} 
              type="number" 
              value={formData.bodyFat} 
              onChange={(e) => setFormData({...formData, bodyFat: e.target.value})} 
            />

            <label className="input-label mb-2 mt-4 block">{t('bodyTypeLabel')}</label>
            <div className="flex flex-col gap-3 mb-2">
              {[
                { id: 'Ectomorph', desc: 'Naturally thin, fast metabolism' },
                { id: 'Mesomorph', desc: 'Athletic, builds muscle easily' },
                { id: 'Endomorph', desc: 'Soft/round, stores fat easily' }
              ].map(bt => (
                <div 
                  key={bt.id}
                  className={`option-card text-left ${formData.bodyType === bt.id ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, bodyType: bt.id})}
                >
                  <div className="font-semibold">{bt.id}</div>
                  <div className="text-sm text-secondary mt-1">{bt.desc}</div>
                </div>
              ))}
            </div>

            <Button 
              className="mt-6 w-full" 
              onClick={handleNext}
              disabled={
                !formData.weight || formData.weight < 35 || formData.weight > 250 || 
                !formData.height || formData.height < 130 || formData.height > 215 ||
                !formData.age || formData.age < 15 || formData.age > 50
              }
            >
              {t('continueBtn')}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content animate-fade-in">
            <h2>{t('dailyActivity')}</h2>
            <p className="text-secondary mb-6">{t('neatDesc')}</p>
            
            <div className="options-grid">
              {['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Athlete'].map((level) => (
                <div 
                  key={level}
                  className={`option-card ${formData.activityLevel === level ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, activityLevel: level})}
                >
                  {level}
                </div>
              ))}
            </div>

            <label className="input-label mb-2 mt-6 block">{t('dailyRoutineLabel')}</label>
            <div className="flex gap-4">
              {['Desk job', 'On my feet all day'].map(rt => (
                <div 
                  key={rt}
                  className={`option-card flex-1 text-center ${formData.dailyRoutine === rt ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, dailyRoutine: rt})}
                >
                  {rt}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="secondary" onClick={handlePrev} className="flex-1">{t('backBtn')}</Button>
              <Button onClick={handleNext} disabled={!formData.activityLevel || !formData.dailyRoutine} className="flex-1">{t('continueBtn')}</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content animate-fade-in">
            <h2>{t('fitnessExp')}</h2>
            <p className="text-secondary mb-6">{t('fitnessDesc')}</p>
            
            <div className="flex flex-col gap-4 mb-6">
              {[
                { id: 'New', label: 'New to working out', desc: 'Prioritizes machine exercises for safety' },
                { id: 'Current', label: 'Currently working out', desc: 'Prioritizes free weights and compound lifts' }
              ].map((exp) => (
                <div 
                  key={exp.id}
                  className={`option-card text-left ${formData.experienceLevel === exp.id ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, experienceLevel: exp.id})}
                >
                  <div className="font-semibold">{exp.label}</div>
                  <div className="text-sm text-secondary mt-1">{exp.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="secondary" onClick={handlePrev} className="flex-1">{t('backBtn')}</Button>
              <Button onClick={handleNext} disabled={!formData.experienceLevel} className="flex-1">{t('continueBtn')}</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content animate-fade-in">
            <h2>{t('routineDiet')}</h2>
            <p className="text-secondary mb-6">{t('volumeDesc')}</p>
            
            <div className="mb-6">
              <label className="input-label">{t('daysPerWeek')} ({formData.daysPerWeek})</label>
              <input 
                type="range" 
                min="2" max="6" 
                value={formData.daysPerWeek}
                onChange={(e) => setFormData({...formData, daysPerWeek: Number(e.target.value)})}
                className="w-full mt-2 slider"
              />
            </div>

            <label className="input-label mb-2">{t('locationLabel')}</label>
            <div className="flex gap-4 mb-6">
              {['Home', 'Gym'].map((loc) => (
                <div 
                  key={loc}
                  className={`option-card flex-1 text-center ${formData.locationPref === loc ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, locationPref: loc})}
                >
                  {loc}
                </div>
              ))}
            </div>

            <label className="input-label mb-2">{t('dietLabel')}</label>
            <div className="input-group">
              <select 
                className="input-field" 
                value={formData.diet}
                onChange={(e) => setFormData({...formData, diet: e.target.value})}
              >
                {['None', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <label className="input-label mb-2 mt-4 block">{t('sensitivitiesLabel')}</label>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Dairy-Free', 'Nut-Free', 'Halal/Kosher'].map(sens => {
                const isSelected = formData.sensitivities.includes(sens);
                return (
                  <div 
                    key={sens}
                    className={`option-card flex-1 text-center ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      const newSens = isSelected 
                        ? formData.sensitivities.filter(s => s !== sens)
                        : [...formData.sensitivities, sens];
                      setFormData({...formData, sensitivities: newSens});
                    }}
                  >
                    {sens}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <Button variant="secondary" onClick={handlePrev} className="flex-1">{t('backBtn')}</Button>
              <Button onClick={handleNext} disabled={!formData.locationPref} className="flex-1">{t('continueBtn')}</Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="step-content animate-fade-in">
            <h2>{t('goalRegion')}</h2>
            <p className="text-secondary mb-6">{t('finalStep')}</p>
            
            <div className="options-grid mb-6">
              {['Bulk (Gain Muscle)', 'Cut (Lose Fat)', 'Recomp'].map((goal) => (
                <div 
                  key={goal}
                  className={`option-card goal-card ${formData.goal === goal ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, goal: goal})}
                >
                  {goal}
                </div>
              ))}
            </div>

            <div className="input-group">
              <label className="input-label">{t('countryLabel')}</label>
              <select 
                className="input-field" 
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="secondary" onClick={handlePrev} className="flex-1">{t('backBtn')}</Button>
              <Button onClick={handleSubmit} disabled={!formData.goal} className="flex-1">{t('buildPlan')}</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Onboarding;
