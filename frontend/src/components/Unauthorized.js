// components/Unauthorized.js
import React from 'react';

const Unauthorized = () => {
  return (
    <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>
      <h2>🚫 Unauthorized Access</h2>
      <p>You do not have permission to view this page.</p>
    </div>
  );
};

export default Unauthorized;
