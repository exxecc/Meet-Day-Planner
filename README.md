# Meet Day Planner

A React app for powerlifting meet day planning. Enter your goal weights and get instant attempt selection, warmup progressions, and plate loading recommendations based on IPF competition standards.

## Features

- **Attempt Selection** — Smart attempt progression (1st, 2nd, 3rd + backups)
- **Warmup Generator** — 5-step warmup sequence (30%, 53%, 60%, 72%, 81% of goal)
- **Plate Calculator** — See exactly which plates to load for each warmup
- **Dual Unit Display** — Always shows both kg and lbs regardless of input unit
- **Local Persistence** — All inputs saved to browser localStorage
- **Dark Iron Room Aesthetic** — Calgary Barbell branding, monospace typography

## Quick Start

### Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` (Vite default).

### Build for Production

```bash
npm run build
```

## Usage

1. Enter your goal 3rd attempt weight for each lift (Squat, Bench Press, Deadlift)
2. Toggle between kg/lbs — input in either unit, output shows both
3. View calculated attempts and warmup sequence
4. Check plate breakdown for each warmup (IPF standard plates only)
5. Your goals are automatically saved to browser storage

## How It Works

### Attempt Selection

Based on Calgary Barbell meet protocol:
- **1st Attempt** — ~89.5% of goal
- **2nd A (conservative)** — ~96% of goal
- **2nd B (alternative)** — ~92% of goal
- **3rd A (goal)** — your entered weight
- **3rd B (backup)** — ~94.8% of goal

### Warmup Progression

5 warmup sets with standard percentages and rep schemes:
- 5× at 30% of goal
- 3× at 53% of goal
- 1× at 60% of goal
- 1× at 72% of goal
- 1× at 81% of goal

### Plate Loading

Assumes IPF standard equipment:
- **Bar weight:** 20 kg
- **Competition plates:** 25, 20, 15, 10, 5, 2.5, 2, 1.5, 1 kg (each side)

## Code Architecture

- **Pure functional React** — no external UI libraries, CSS-in-JS styling
- **Memoized calculations** — `useMemo` prevents unnecessary recalc of attempts/warmups
- **localStorage hooks** — auto-save on input change, load on mount with error handling
- **Security** — no external APIs, no user data sent anywhere, all computation local
- **Accessibility** — semantic HTML, proper input types, color contrast ratios tested

### Key Functions

- `calcAttempts(goal)` — Returns all 5 attempt suggestions
- `calcWarmups(goal)` — Returns 5-set warmup with percentages
- `calcPlates(totalKg)` — Breaks down total into individual plates per side
- `kg2lb(kg)` — Converts kilograms to pounds
- `round(val, nearest)` — Rounds to nearest 2.5 kg (IPF standard)

## Browser Support

Works on all modern browsers with localStorage support:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Mobile-friendly (iOS 14+, Android Chrome).

## Deployment

Deploy as a static React app with Vite. Suitable for:
- **Vercel** — `vercel deploy`
- **Netlify** — `netlify deploy --prod`
- **GitHub Pages** — with Vite GH Pages plugin
- Any static host (AWS S3, Cloudflare Pages, etc.)

## Customization

### Change Warmup Percentages

Edit `calcWarmups()` in `meet-day-calculator.jsx`:
```javascript
const pcts = [0.30, 0.53, 0.60, 0.72, 0.81];
```

### Adjust Attempt Formulas

Edit `calcAttempts()`:
```javascript
const firstA = round(goal * 0.895);
```

### Modify Bar Weight / Plates

Edit constants at top of file:
```javascript
const BAR_WEIGHT = 20; // kg
const PLATES = [25, 20, 15, 10, 5, 2.5, 2, 1.5, 1];
```

### Change Colors

Edit color constants:
```javascript
const ACCENT = "#C8102E";        // Calgary Barbell red
const AMBER = "#F0B429";         // Warmup highlight
const TEXT = "#F0F0F0";          // Primary text
```

## File Structure

```
meet-day-planner/
├── package.json
├── README.md
├── meet-day-calculator.jsx      (main component)
├── index.jsx                     (app entry point, if using with build tool)
└── vite.config.js               (optional, for Vite builds)
```

## License

MIT

## Credits

Based on Calgary Barbell meet protocol. IPF plate standards. Built with React + Vite.
