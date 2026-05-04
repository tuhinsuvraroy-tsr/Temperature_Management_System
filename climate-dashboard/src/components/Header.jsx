import { useEffect, useState } from "react";

function Header() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const formatted = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setTime(formatted + " IST");
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <h1 className="title">Climate Dashboard</h1>
      <div className="clock">{time}</div>
    </header>
  );
}

export default Header;