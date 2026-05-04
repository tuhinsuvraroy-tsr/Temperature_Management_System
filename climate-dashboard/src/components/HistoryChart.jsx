// we are using react-chartjs-2 to create interactive, animated data visualizations (graphs and charts) within React applications and taken help of ai

function HistoryChart() {
  const temps = [28, 29, 30, 32, 34, 35];

  return (
    <div className="glass-card chart">
      <h2>Temperature History</h2>

      <div
        style={{
          height: "200px",
          display: "flex",
          alignItems: "end",
          justifyContent: "center",
          gap: "12px",
          marginTop: "20px",
          width: "fit-content",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {temps.map((temp, i) => (
          <div
            key={i}
            style={{
              width: "22px",
              height: `${temp * 3}px`,
              background: "rgba(79, 172, 254, 0.8)",
              borderRadius: "6px",
              transition: "0.3s",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default HistoryChart;