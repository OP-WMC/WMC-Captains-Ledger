import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#ffffff',
      color: '#333',
      padding: '15px 20px',
      textAlign: 'center',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      borderRadius: '8px',
      maxWidth: '90%',
      fontSize: '14px'
    }}>
      <span>
        We use cookies to improve your experience.
      </span>
      <button
        style={{
          marginLeft: '15px',
          padding: '8px 14px',
          cursor: 'pointer',
          backgroundColor: '#4daafc',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'background-color 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#3399f0'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#4daafc'}
        onClick={acceptCookies}
      >
        Accept
      </button>
    </div>
  );
}
