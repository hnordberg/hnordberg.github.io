'use client'

import { useState } from 'react';
import Image from 'next/image';
import './style.css';

const ContactPage = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const revealEmail = () => {
    if (email) return; // Already revealed
    
    setLoading(true);
    // Obfuscated email - requires JS to decode
    // Base64 encoded: aG5vcmRiZXJnQGFwYWNoZS5vcmc=
    setTimeout(() => {
      try {
        const encoded = 'aG5vcmRiZXJnQGFwYWNoZS5vcmc=';
        const decoded = atob(encoded);
        setEmail(decoded);
      } catch (error) {
        console.error('Failed to decode email:', error);
        setEmail('Error loading email');
      } finally {
        setLoading(false);
      }
    }, 100); // Small delay to ensure JS execution
  };

  return (
    <main>
      <div className="contact-container">
        <Image src='/img/henrik.avatar.2025.png' width="100" height="100" alt="Photo of Henrik Nordberg" title="Photo of Henrik Nordberg" />
        <div className="contact-details">
          {email ? (
            <a href={`mailto:${email}`}>{email}</a>
          ) : (
            <button 
              onClick={revealEmail} 
              className="reveal-email-btn"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Click to reveal email'}
            </button>
          )}
          <br />
          <a href='https://linkedin.com/in/hnordberg'>linkedin.com/in/hnordberg</a>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
