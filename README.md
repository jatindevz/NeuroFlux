# 🧠 NeuroFlux  
<br>
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue?logo=react)&nbsp;![Expo](https://img.shields.io/badge/Expo-54.0.33-5f3dc4?logo=expo)&nbsp;![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript)&nbsp;![Zustand](https://img.shields.io/badge/Zustand-5.0.11-green?logo=react)&nbsp;![AsyncStorage](https://img.shields.io/badge/AsyncStorage-2.2.0-yellow?logo=react)&nbsp;![SVG](https://img.shields.io/badge/SVG-react--native--svg-red)

> **A gamified mental state tracker: monitor brain "energy" & "volatility", then reset with a 21‑day habit challenge.**

---

## 📘 Introduction

This project reimagines habit tracking by modeling your mind as a living system. Instead of counting hours or streaks, it quantifies your **mental energy** (0–100) and **volatility** (0–100), capturing how activities push you closer to calm or chaos. A third derived value, **momentum** (-10 to 10), reflects recent trends.

Two complementary systems live together:

* **Daily Brain Tracking** – log activities, watch energy/volatility move, and learn from the numbers.
* **21‑Day Reset Challenge** – choose a structured program (Foundation or Build) with required/optional tasks, earn points, and build a streak.

The philosophy: awareness + action = lasting change.

---

## ⭐ Key Features

### 🧠 Brain Metrics Engine

* **Energy** decreases with bad habits, increases with restorative actions.
* **Volatility** measures instability; high volatility amplifies energy loss.
* **Momentum** is a rolling mix of recent energy changes, clipped to ±10.
* Logging the same addictive activity compounds damage via a multiplier.

### 🌗 Day/Night Cycle

* Once the clock heads toward night, logging is frozen.
* At **4 AM local time**, the session resets automatically (or via a manual button) and the previous volatility becomes tomorrow’s energy penalty.
* A carry‑over mechanism softens brutal resets while still rewarding calm days.

### 🔄 21‑Day Reset Challenge

* **Modes**: `foundation` (gentle habits) or `build` (advanced tasks).
* Each day presents one **required** task + two **optional** ones, randomly picked.
* Complete tasks to earn points; required task completion preserves your streak.
* Streaks auto‑advance after 4 AM, with penalties for missed required tasks.
* State persists across launches with AsyncStorage.

### 🚨 Urge Protocol (in codebase hints)

Components (not yet listed) include Box Breathing, Physical Reset, and a 10‑minute delay timer to help users ride out cravings.

### 📈 Analytics & Forecasting

* Daily logs are stored and summarized in `history` with rolling linear regressions.
* Trend screen predicts future energy/volatility trajectories.

### 🎨 UI/UX Polished Experience

* Dark‑themed aesthetic with fluid animations (SVG graphs, circular progress).
* Haptic feedback on touch (via `expo-haptics`).
* Responsive layout for mobile & web via Expo Router.

---

## 🛠️ Tech Stack

* **Framework**: Expo SDK 54 / React Native 0.81.5
* **Navigation**: `expo-router` (file-based routing, nested layouts)
* **State Management**: `zustand` (+ `persist` middleware)
* **Storage**: `@react-native-async-storage/async-storage` / `react-native-mmkv`
* **Charts & Icons**: `react-native-svg`, `lucide-react-native`
* **Haptics & System UI**: `expo-haptics`, `expo-linear-gradient`, `expo-system-ui`
* **Utilities**: `@tanstack/react-query` (possibly used in trend screen)
* **Types & Linting**: TypeScript, ESLint with `eslint-config-expo`

---

## 🏗️ Architecture Overview

State is intentionally split:

* **Session (RAM)** – high‑frequency values (energy, volatility, momentum, today’s activities) live only in `brainSessionStore.ts` and reset daily.
* **History (Disk)** – low‑frequency data (`DailyLog[]`, last reset date) is persisted with AsyncStorage via Zustand middleware.
* **Challenge** – `reset21Store.ts` handles the 21‑day logic with its own persistence.

Folder structure mirrors the domain: `components/` for UI pieces, `constants/` for static definitions, `store/` for state, and `types/` for shared interfaces.

---

## 🚀 Installation & Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/brainenergy-21.git
   cd brainenergy-21
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the development server**
   ```bash
   npx expo start
   ```

   Optionally choose one of:
   * `npm run android` – Android emulator/device
   * `npm run ios` – iOS simulator/device
   * `npm run web` – web preview

### 🔧 Requirements

* Node.js ≥ 18 (LTS recommended)
* Expo CLI installed globally (`npm install -g expo-cli`)
* Xcode/Android Studio for simulators (if targeting native devices)

---

## ⚙️ How It Works (Logic Deep Dive)

### 🔢 The Algorithm

* Activities supply `energyDelta` and `volatilityDelta` values. The store clamps energy/volatility within [0,100].
* Addictive activities increment a multiplier (1 + 0.25 × occurrences) to simulate compounding urges.
* `momentum` is calculated on each log as `momentum * 0.6 + energyDelta * 0.4`, bounded at ±10.
* During 4 AM rollover, volatility becomes a negative addition to the new day’s energy. This models carry‑over stress.

### 💾 Data Persistence

Zustand’s `persist` middleware wraps stores with AsyncStorage; namespaced keys (`brain-history-storage`, `reset21-storage`) keep data isolated. History is trimmed to 30 days to bound storage.

---

## 📸 Screenshots / Visuals

_**(Placeholders below - replace with actual images before publishing)**_

* ![Dashboard screenshot](./screenshots/dashboard.png)
* ![Timeline screenshot](./screenshots/history.png)
* ![Trend graph screenshot](./screenshots/trend.png)
* ![21‑Day Challenge screenshot](./screenshots/reset21.png)

---

## 🚧 Future Roadmap

1. **Push notifications** for end‑of-day reset and task reminders.
2. **Cloud sync** with optional user accounts (Firebase/Realm).
3. **Social sharing** of trends & earned points.
4. **Custom activity creation** and deeper analytics (weekly averages, heatmaps).

Contributions and ideas welcome!

---

## 📄 License & Contribution

This project is released under the **MIT License**. See [LICENSE](LICENSE) for details.

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/foo`)
3. Commit your changes (`git commit -am 'Add foo'`)
4. Push to the branch (`git push origin feature/foo`)
5. Open a pull request detailing your changes

Please follow the existing coding style and add tests where appropriate. For major changes, open an issue first to discuss the idea.

---

Thanks for checking out **NeuroFlux**! Let's build healthier brains, one day at a time. 💪
