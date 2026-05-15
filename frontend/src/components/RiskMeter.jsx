import React from 'react';

const RiskMeter = ({ score, prediction }) => {
  let color = 'var(--text-main)';
  let bg = 'var(--panel-bg)';

  if (prediction.toLowerCase() === 'phishing') {
    color = '#fff';
    bg = 'var(--danger)';
  } else if (score > 50) {
    color = '#333';
    bg = 'var(--warning)';
  } else {
    color = '#fff';
    bg = 'var(--safe)';
  }

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: bg, color, borderRadius: '4px', textAlign: 'center' }}>
      <h3 style={{ margin: 0 }}>Prediction: {prediction.toUpperCase()}</h3>
      <p style={{ margin: 0 }}>Risk Score: {score}/100</p>
    </div>
  );
};

export default RiskMeter;
