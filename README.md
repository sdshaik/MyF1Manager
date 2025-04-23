# 🏎️ F1 Manager — Formula 1 Dashboard (Angular + ERGAST API)

An Angular-powered web application that brings the world of Formula 1 to your fingertips. The **F1 Manager** app fetches live and historical racing data from the [ERGAST Developer API](https://ergast.com/mrd/) and presents it in a modern, responsive, and visually rich dashboard experience inspired by [Formula1.com](https://www.formula1.com/).


---

## 🔧 Tech Stack

- **Frontend**: Angular 17+
- **Styling**: Bootstrap 5, SCSS
- **API**: [ERGAST Developer API](https://ergast.com/mrd/)
- **Routing**: Angular Router (lazy-loaded modules)
- **Deployment**: GitHub Pages

---

## 📦 Features

- 🏁 **Home**: Next race preview & recent results
- 📅 **Schedule**: Full race calendar (filter by season, round)
- 🏆 **Standings**: Live driver & constructor rankings
- 🧑‍✈️ **Drivers**: Grid of all drivers with bios & career stats
- 🛠️ **Teams**: Constructor details & race history
- 📊 **Results**: View results by season & round
- ⏱️ **Live Timing** *(coming soon)*

---

## 🔌 ERGAST API

All data is fetched from the [ERGAST F1 API](https://ergast.com/mrd/):
- Base URL: `https://ergast.com/api/f1`
- Format: JSON (`.json` suffix required)
- No auth or API key required 🎉

Example:
```http
GET https://ergast.com/api/f1/current/driverStandings.json:


