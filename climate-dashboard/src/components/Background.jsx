import { useEffect, useState } from "react";

function Background() {
    // store current background type (dawn/day/dusk/night)
  const [bgClass, setBgClass] = useState("day");

  useEffect(() => { //to update background based on current time
    const updateBackground = () => {
      const hour = new Date().getHours(); // Get current hour (0–23)

      if (hour >= 5 && hour < 10) setBgClass("dawn");  //Morning
      else if (hour >= 10 && hour < 17) setBgClass("day");  //DayTime
      else if (hour >= 17 && hour < 20) setBgClass("dusk");  //Evening
      else setBgClass("night");  //Night
    };

    updateBackground();
    const interval = setInterval(updateBackground, 60000); // Update every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <>
      <div className={`background ${bgClass}`}></div> //Dynamic background class
      <div className="overlay"></div> //Overlay for readability
    </>
  );
}

export default Background;