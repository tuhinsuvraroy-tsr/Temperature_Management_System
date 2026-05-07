import React, { useState, useEffect, useMemo } from 'react';

// Firebase — npm package replaces CDN imports, logic is IDENTICAL to script.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

import initialLocations from './data/location';
import {
  calculateAverages,
  generateMinMaxData,
  getBackgroundState,
  getISTTimeString,
} from './utils/helper';

import Background    from './Components/Background';
import Header        from './Components/Header';
import HeroStats     from './Components/HeroStats';
import LocationsGrid from './Components/LocationGrid';
import MinMaxSection from './Components/MinMaxSection';
import HistoryChart  from './Components/HistoryChart';
import Footer        from './Components/Footer';

// =============================================================================
// Firebase initialization — EXACT config from script.js (unchanged)
// =============================================================================
const firebaseConfig = {
  databaseURL: 'https://rishihood-temperature-tracker-default-rtdb.firebaseio.com',
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
// =============================================================================

function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [locations, setLocations] = useState(initialLocations);
  const [clockTime, setClockTime] = useState('Loading Time...');
  const [bgState, setBgState]     = useState(() => getBackgroundState(new Date()));

  // Stable per page-load: generated once from initial fallback data
  const minMaxData = useMemo(() => generateMinMaxData(initialLocations), []);

  // ── Clock + Background (replaces updateClock + updateBackground) ───────────
  useEffect(() => {
    function tick() {
      const now = new Date();
      setClockTime(getISTTimeString(now));
      setBgState(getBackgroundState(now));
    }
    tick();                            // run immediately on mount
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);   // cleanup on unmount
  }, []);

  // ── Firebase listener — EXACT logic from script.js lines 252-301 ──────────
  useEffect(() => {
    const campusRef = ref(db, 'campus');

    // ESP → location name map (unchanged)
    const espNameMap = {
      esp1: 'A Block',
      esp2: 'B Block',
      esp3: 'C Block',
      esp4: 'Learners Arena',
      esp5: 'Residency 2',
    };

    const unsubscribe = onValue(campusRef, (snapshot) => {
      const firebaseData = snapshot.val();
      if (!firebaseData) return;

      // Build new locations array from Firebase snapshot
      const newLocations = [];
      Object.keys(firebaseData).forEach((espId) => {
        const esp = firebaseData[espId];
        newLocations.push({
          id:       espId,
          name:     espNameMap[espId] || espId.toUpperCase(),
          temp:     esp.temp,
          humidity: esp.humidity,
        });
      });

      setLocations(newLocations);
      // Note: minMaxData and chart data are NOT re-randomized on Firebase updates (stable per page load)
    });

    return () => unsubscribe(); // detach listener on unmount
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────
  const { avgTemp, avgHumidity } = calculateAverages(locations);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Background
        bgClass={bgState.bgClass}
        celestialClass={bgState.celestialClass}
        celestialStyle={bgState.celestialStyle}
      />

      <Header clockTime={clockTime} />

      <main>
        {/* HeroStats manages its own container */}
        <HeroStats avgTemp={avgTemp} avgHumidity={avgHumidity} />

        {/* Rest of sections share a container */}
        <div className="container">
          <LocationsGrid locations={locations} />
          <MinMaxSection minMaxData={minMaxData} />
          <HistoryChart locations={locations} />
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;
