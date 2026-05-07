# Smart Climate Monitoring Dashboard

## Overview

This project is a React.js-based dashboard for monitoring temperature and humidity across multiple locations. It provides a clear and interactive interface with real-time updates and data visualization.

The application is designed with a component-based architecture and focuses on simplicity, scalability, and clean UI design.

---

## Features

* Time-based dynamic background (dawn, day, dusk, night)
* Live clock updated in real time
* Temperature and humidity display for multiple locations
* Conditional styling based on temperature levels
* 24-hour temperature trend visualization using charts
* Daily minimum and maximum temperature insights
* Automatic calculation of average temperature and humidity

---

## Tech Stack

* **Frontend:** React for building a component-based user interface
* **UI Library:** Ant Design for responsive layout and pre-built components
* **Charts:** Chart.js integrated using react-chartjs-2 for data visualization
* **Styling:** Custom CSS for animations, layout, and glassmorphism design
* **Data Handling:** JavaScript with API-ready structure for future backend integration

---

## Project Structure

```bash
src/
├── components/
│   ├── Background.jsx
│   ├── Header.jsx
│   ├── HeroStats.jsx
│   ├── LocationsGrid.jsx
│   ├── LocationCard.jsx
│   ├── MinMaxSection.jsx
│   ├── HistoryChart.jsx
│   └── Footer.jsx
│
├── data/
│   └── locations.js
│
├── utils/
│   ├── calculations.js
│   ├── timeUtils.js
│   └── chartUtils.js
│
├── styles/
│   └── global.css
│
├── App.jsx
└── main.jsx
```

---

## Installation

```bash
git clone <your-repo-link>
cd climate-dashboard
npm install
npm run dev
```

---

## Notes

* The UI is built using custom CSS and integrated with Ant Design components.
* Data structure is prepared for backend or API integration.
* Random data used for charts and statistics is stable per page load.

---

## Future Improvements

* Integration with real-time data sources
* Backend support for persistent data
* User authentication and role-based access
* Improved analytics and reporting features

---

## Summary

This project demonstrates the ability to build a structured, maintainable, and interactive frontend dashboard using modern React practices.