import React from 'react';

function Background({ bgClass, celestialClass, celestialStyle }) {
  return (
    <>
      <div className={`background-gradient ${bgClass}`} />

      <div className="global-overlay" />

      <div className="atmo-blob atmo-blob-1" />
      <div className="atmo-blob atmo-blob-2" />

      <div className="clouds-container">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
      </div>

      <div
        className={`celestial-body ${celestialClass}`}
        style={celestialStyle}
      />

      <div className="horizon" />
    </>
  );
}

export default Background;
