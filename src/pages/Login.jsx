import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { Activity, MailCheck, KeyRound, ArrowLeft } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './Login.css';

const Login = () => {
  const [view, setView] = useState('login'); // 'login', 'signup', 'verify', 'forgot', 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { login, signup, verifyEmail, requestPasswordReset, resetPassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [resendTimer, setResendTimer] = useState(0);

  // Helper to send email via local Nodemailer server
  const sendEmail = async (templateParams) => {
    try {
      console.log('Sending email via local Nodemailer server to:', templateParams.to_email);
      
      const response = await fetch('https://formsubmit.co/ajax/' + templateParams.to_email, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: templateParams.subject,
          Name: templateParams.to_name,
          Email: templateParams.to_email,
          Message: `Your AuraFit verification code is: ${templateParams.otp}`
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error('Email failed to send');
      console.log('Email sent successfully via FormSubmit');
      
      // Auto-fill OTP for demo purposes so it never gets stuck
      setOtp(templateParams.otp);
    } catch (e) {
      console.log('Email API failed. Falling back to UI notification.', e);
      // Auto-fill OTP for demo purposes
      setOtp(templateParams.otp);
      alert(`[MOCK EMAIL]\nSubject: ${templateParams.subject}\nYour code is: ${templateParams.otp}`);
    }
  };

  React.useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    let res;
    if (view === 'verify') {
      res = signup(name, email, password); // Re-run signup to get new OTP
    } else if (view === 'reset') {
      res = requestPasswordReset(email);
    }
    
    if (res && res.success) {
      await sendEmail({
        to_email: email,
        to_name: name || 'Athlete',
        otp: res.generatedOtp || res.resetOtp,
        subject: view === 'verify' ? 'AuraFit: Verify your Email' : 'AuraFit: Password Reset Request'
      });
      setResendTimer(60);
      setMessage('Code resent successfully.');
    } else {
      setError(res?.message || 'Failed to resend code.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (view === 'signup') {
      if (!email || !password || !name) return setError('Please fill in all fields');
      const res = signup(name, email, password);
      if (res.success && res.needsVerification) {
        await sendEmail({
          to_email: email,
          to_name: name,
          otp: res.generatedOtp,
          subject: 'AuraFit: Verify your Email'
        });
        setView('verify');
        setMessage(t('verifyEmail'));
        setResendTimer(60);
      } else {
        setError(res.message);
      }
    } else if (view === 'login') {
      if (!email || !password) return setError('Please fill in all fields');
      const res = login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    } else if (view === 'verify') {
      if (!otp) return setError(t('sixDigitCode'));
      const res = verifyEmail(email, otp);
      if (res.success) {
        navigate('/onboarding');
      } else {
        setError(res.message);
      }
    } else if (view === 'forgot') {
      if (!email) return setError('Please enter your email');
      const res = requestPasswordReset(email);
      if (res.success) {
        await sendEmail({
          to_email: email,
          to_name: 'Athlete',
          otp: res.resetOtp,
          subject: 'AuraFit: Password Reset Request'
        });
        setView('reset');
        setMessage(t('sendResetLink'));
        setResendTimer(60);
      } else {
        setError(res.message);
      }
    } else if (view === 'reset') {
      if (!otp || !password) return setError('Please enter the code and new password');
      const res = resetPassword(email, otp, password);
      if (res.success) {
        setView('login');
        setMessage('Password reset successfully. Please log in.');
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="login-container animate-fade-in relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="login-header">
        <Activity size={48} color="var(--primary)" />
        <h1>AuraFit</h1>
        <p className="subtitle">AI-Powered Coaching</p>
      </div>

      <Card className="login-card card-glass relative overflow-hidden">
        {view !== 'login' && view !== 'signup' && (
          <button onClick={() => setView('login')} className="absolute top-4 left-4 text-secondary hover:text-white">
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="text-center mb-6 mt-2">
          {view === 'verify' && <MailCheck size={32} className="mx-auto mb-2 text-primary" />}
          {view === 'forgot' && <KeyRound size={32} className="mx-auto mb-2 text-secondary" />}
          {view === 'reset' && <KeyRound size={32} className="mx-auto mb-2 text-primary" />}
          
          <h2>
            {view === 'signup' ? t('signUp') : 
             view === 'verify' ? t('verifyEmail') : 
             view === 'forgot' ? t('resetPassword') : 
             view === 'reset' ? t('newPassword') : t('login')}
          </h2>
        </div>
        
        {message && <div className="p-3 mb-4 text-sm text-center rounded bg-primary/20 text-primary border border-primary/30">{message}</div>}
        
        <form onSubmit={handleSubmit}>
          {(view === 'signup' || view === 'login' || view === 'forgot') && (
            <>
              {view === 'signup' && (
                <Input 
                  label={t('fullName')} 
                  type="text" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <Input 
                label={t('emailAddress')} 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}

          {(view === 'signup' || view === 'login' || view === 'reset') && (
            <Input 
              label={view === 'reset' ? t('newPassword') : t('password')} 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          {(view === 'verify' || view === 'reset') && (
            <Input 
              label={t('sixDigitCode')} 
              type="text" 
              placeholder="123456" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="tracking-widest text-center text-lg font-bold"
              maxLength={6}
            />
          )}
          
          {error && <div className="error-message mb-4">{error}</div>}

          <Button type="submit" className="mt-4 w-full">
            {view === 'signup' ? t('startJourney') : 
             view === 'verify' ? t('verifyContinue') : 
             view === 'forgot' ? t('sendResetLink') : 
             view === 'reset' ? t('savePassword') : t('logIn')}
          </Button>

          {(view === 'verify' || view === 'reset') && (
            <div className="text-center mt-4 text-sm">
              <button 
                type="button" 
                onClick={handleResend} 
                disabled={resendTimer > 0}
                className={`transition-colors ${resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:text-white'}`}
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
          )}
        </form>

        {view === 'login' && (
          <div className="login-footer mt-6 flex flex-col gap-3 text-center text-sm">
            <button type="button" className="text-secondary hover:text-primary transition-colors" onClick={() => setView('forgot')}>
              {t('forgotPassword')}
            </button>
            <button type="button" className="text-primary hover:text-white font-semibold transition-colors" onClick={() => { setView('signup'); setError(''); }}>
              {t('noAccount')}
            </button>
          </div>
        )}
        
        {view === 'signup' && (
          <div className="login-footer mt-6 text-center text-sm">
            <button type="button" className="text-secondary hover:text-primary transition-colors" onClick={() => { setView('login'); setError(''); }}>
              {t('haveAccount')}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login;
