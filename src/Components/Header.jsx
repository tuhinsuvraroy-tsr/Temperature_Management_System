import React from 'react';

function Header({ clockTime }) {
  return (
    <header>
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-icon">🌡️</span>
          <span className="header-title">Rishihood University · Heat Tracker</span>
        </div>
        <div className="clock-badge">
          <span className="clock-dot" />
          {clockTime}&nbsp;IST
        </div>
      </div>
    </header>
  );
}

export default Header;
