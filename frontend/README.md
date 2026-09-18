# LifeTrack Pro — Web Telemetry Client

The official high-performance frontend client for **LifeTrack Pro**, unifying double-entry financial ledgering with atomic habit discipline.

---

## ⚡ Core Architecture

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (Deep Telemetry Dark Palette `#07090e`)
- **Typography:** Inter (Primary UI) & JetBrains Mono (Financial Telemetry)
- **Routing:** React Router v7 with dynamic page title synchronization (`useDocumentTitle` & `RouteTitleSynchronizer`)
- **Icons:** Lucide React
- **API Transport:** Axios with automatic JWT Bearer injection & silent token refresh

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm or pnpm

### Development Server
```bash
npm install
npm run dev
```
The client will start at `http://localhost:5173`.

### Production Build
```bash
npm run build
```
Generates type-checked, minified production assets in `dist/`.

### Linting
```bash
npm run lint
```

---

## 🛡️ Brand Standards

All views strictly conform to the LifeTrack Pro brand standard:
- **Title Format:** `LifeTrack Pro | <View Name>`
- **Color Identity:** Obsidian (`#07090e`), Indigo (`#6366f1`), Emerald (`#10b981`), Cyan (`#38bdf8`)
- **PWA Ready:** Web App Manifest configured for standalone installability on iOS and Android.
