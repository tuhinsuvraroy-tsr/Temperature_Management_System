import Header from "./components/Header";
import Background from "./components/Background";
import HeroStats from "./components/HeroStats";
import LocationsGrid from "./components/LocationsGrid";
import MinMaxSection from "./components/MinMaxSection";
import HistoryChart from "./components/HistoryChart";

function App() {
  return (
    <>
      <Background />

      <div className="container">
        <Header />

        <main>
          <HeroStats />
          <LocationsGrid />
          <MinMaxSection />
          <HistoryChart />
        </main>
      </div>
    </>
  );
}

export default App;