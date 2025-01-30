import React from 'react';
import twilioImage from './img/twilio.png';

const Twilio = () => {
  return (
    <div className="p-6">
      <h1>Below is the profile configuration page where users can Opt In to receive text messages from www.idioma-ai.com</h1>
      <img src={twilioImage} alt="Twilio" className="mt-4" />
      {/* ...existing code... */}
    </div>
  );
};

export default Twilio;
