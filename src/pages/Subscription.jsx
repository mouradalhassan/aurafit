import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Check, CreditCard, Loader, X } from 'lucide-react';
import './Subscription.css';

const Subscription = () => {
  const { user, updateSubscription } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [is3DSecure, setIs3DSecure] = useState(false);
  const [success, setSuccess] = useState(false);

  const plans = [
    {
      id: 'Free',
      name: 'Free',
      price: '$0',
      period: '/forever',
      features: ['Basic Macro Calculation', 'Standard Workout Generator', '1 Photo Log per Day']
    },
    {
      id: 'Pro',
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      features: ['Advanced BMR/TDEE Logic', 'Daily Changing Routines', 'Unlimited Photo Logs', 'Basic AI Verification']
    },
    {
      id: 'High Pro',
      name: 'High Pro',
      price: '$19.99',
      period: '/month',
      features: ['Everything in Pro', 'Premium Dietitian Recipes', 'HD GIF Workout Videos', 'Priority Support']
    }
  ];

  const handleCheckout = (planId) => {
    if (planId === 'Free') return;
    setSelectedPlan(planId);
  };

  const processPayment = () => {
    setIsPaying(true);
    // Mock network request
    setTimeout(() => {
      setIsPaying(false);
      setIs3DSecure(true); // Trigger 3D Secure instead of immediate success
    }, 1500);
  };

  const handle3DSecure = () => {
    setIs3DSecure(false);
    updateSubscription(selectedPlan, 1); // 1 month
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSelectedPlan(null);
    }, 2000);
  };

  return (
    <div className="subscription-container animate-fade-in">
      <header className="page-header">
        <h2>My Plan</h2>
      </header>

      <p className="text-secondary mb-6 text-center">Current Plan: <strong className="text-primary">{user?.subscriptionPlan}</strong></p>

      <div className="plans-grid">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`plan-card ${user?.subscriptionPlan === plan.id ? 'current-plan' : ''}`}
          >
            {user?.subscriptionPlan === plan.id && <div className="current-badge">Active</div>}
            <h3>{plan.name}</h3>
            <div className="plan-price">
              <span className="amount">{plan.price}</span>
              <span className="period">{plan.period}</span>
            </div>
            
            <ul className="plan-features">
              {plan.features.map((feature, idx) => (
                <li key={idx}><Check size={16} color="var(--primary)" /> {feature}</li>
              ))}
            </ul>

            <Button 
              className="w-full mt-auto" 
              variant={plan.id === 'High Pro' ? 'primary' : 'outline'}
              disabled={user?.subscriptionPlan === plan.id}
              onClick={() => handleCheckout(plan.id)}
            >
              {user?.subscriptionPlan === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </Button>
          </Card>
        ))}
      </div>

      {selectedPlan && !success && (
        <div className="payment-modal-overlay">
          <Card className="payment-modal card-elevated">
            <button className="close-btn" onClick={() => setSelectedPlan(null)}><X size={20} /></button>
            <h3 className="mb-4">Complete Checkout</h3>
            <p className="text-secondary mb-4">Upgrading to {selectedPlan}</p>
            
            <div className="payment-methods mb-6" style={{display: 'flex', gap: '8px', overflowX: 'auto'}}>
              <div className="payment-method active" style={{flex: '0 0 auto', padding: '0.5rem 1rem'}}>
                <CreditCard size={18} className="mr-2" /> Stripe
              </div>
              <div className="payment-method" style={{flex: '0 0 auto', padding: '0.5rem 1rem'}}>
                <span className="font-semibold">PayPal</span>
              </div>
              <div className="payment-method" style={{flex: '0 0 auto', padding: '0.5rem 1rem'}}>
                <span className="font-semibold italic">Visa Checkout</span>
              </div>
            </div>

            <div className="mock-input">Card Number: •••• •••• •••• 4242</div>
            <div className="flex gap-4 mb-6">
              <div className="mock-input flex-1">MM/YY</div>
              <div className="mock-input flex-1">CVC</div>
            </div>

            <Button className="w-full" onClick={processPayment} disabled={isPaying}>
              {isPaying ? <Loader className="spinner" size={20} /> : `Pay Securely`}
            </Button>
            <p className="text-secondary text-center mt-4" style={{fontSize: '0.7rem'}}>
              *This is a mock payment flow for prototyping.
            </p>
          </Card>
        </div>
      )}

      {is3DSecure && (
        <div className="payment-modal-overlay">
          <Card className="payment-modal text-center card-elevated">
            <h3 className="mb-4">3D Secure Verification</h3>
            <p className="text-secondary mb-4 text-sm">Please verify your card with your bank to complete this secure transaction.</p>
            <div className="mock-input mb-6 text-center" style={{letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold'}}>
              ••• •••
            </div>
            <Button className="w-full" onClick={handle3DSecure}>
              Authorize Payment
            </Button>
            <p className="text-secondary text-center mt-4" style={{fontSize: '0.7rem'}}>
              *Mock authentication flow
            </p>
          </Card>
        </div>
      )}

      {success && (
        <div className="payment-modal-overlay">
          <Card className="payment-modal text-center card-elevated">
            <div className="success-icon mb-4"><Check size={48} color="white" /></div>
            <h3>Payment Successful!</h3>
            <p className="text-secondary">Your account has been upgraded.</p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Subscription;
