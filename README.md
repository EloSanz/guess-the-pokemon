# Guess the Pokémon 🎮

A simple single-player Pokémon guessing game built with React. Guess Pokémon names with progressive hints!

## Features

- **Real-time multiplayer**: Multiple players can join and play simultaneously
- **Progressive hints**: Emoji → Text → Pixelated sprite revealed over time
- **Admin controls**: Special admin can manually reveal hints and answers for all players
- **Scoring system**: Points based on correct guesses with streak bonuses
- **Round-based gameplay**: 90-second rounds with automatic progression
- **Live synchronization**: All players see the same game state in real-time
- **Responsive UI**: Clean, modern interface built with Tailwind CSS + shadcn/ui
- **Admin authentication**: Secure admin login with password protection
- **Anti-abuse**: Cooldown system and input validation

## Tech Stack

- **Frontend**: React + Vite + Zustand + Tailwind CSS + shadcn/ui
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand for local state
- **Build Tool**: Vite for fast development

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm

### Installation & Running

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   pnpm dev
   ```

   This will start both the backend server (port 3001) and frontend (port 5173).

3. **Open your browser:**
   Visit http://localhost:5173

### Admin Access

To become an admin and control the game:

1. Click the "Admin Panel" button in the header
2. Enter password: `admin123`
3. Use the admin controls to reveal hints and answers for all players

**Note**: Only one admin can be connected at a time.

### Building for Production

```bash
pnpm build
pnpm preview
```

## Project Structure

```
guess-the-pokemon/
├── frontend/              # React frontend (only package)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── AuthModal.jsx
│   │   │   ├── GameCard.jsx
│   │   │   ├── GuessInput.jsx
│   │   │   ├── RoundTimer.jsx
│   │   │   └── StatsPanel.jsx
│   │   ├── pages/           # Page components
│   │   │   └── GamePage.jsx
│   │   ├── stores/          # Zustand stores
│   │   │   └── gameStore.js # Game state management
│   │   ├── lib/             # Utilities
│   │   │   └── utils.js     # Utility functions
│   │   └── main.jsx         # App entry point
│   ├── public/              # Static assets (empty for now)
│   └── package.json
├── pnpm-workspace.yaml     # Workspace configuration
└── package.json           # Root package.json
```

## How to Play

1. **Enter your nickname** when prompted
2. **Guess the hidden Pokémon** by typing its name
3. **Hints are revealed progressively**:
   - 20 seconds: First hint appears
   - 35 seconds: Second hint appears
   - 50 seconds: Third hint appears
4. **Correct guesses earn points** and continue the streak
5. **Wrong guesses** cost points and reset your streak
6. **Rounds automatically advance** every 90 seconds

## Scoring System

- **Correct guess**: 100 points + 10 points per streak
- **Wrong guess**: -5 points (minimum 0)
- **Cooldown**: 2 seconds between guesses
- **Streak bonus**: Extra points for consecutive correct guesses

## Game Features

- **10 different Pokémon** to guess from
- **Progressive hint system** for fair gameplay
- **Score tracking** with streaks
- **Cooldown system** to prevent spam
- **Responsive design** that works on all devices
- **No server required** - runs entirely in the browser
- **Local storage** for nickname persistence

## Development

### Available Scripts

```bash
# Root level
pnpm dev          # Start frontend development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Lint code
pnpm format       # Format code
pnpm clean        # Clean build artifacts
```

### Code Quality

- **Linting**: ESLint with React-specific rules
- **Formatting**: Prettier
- **Build Tool**: Vite for fast development and optimized production builds

## Deployment

### Automatic Deployment (Recommended)

The project includes GitHub Actions for automatic deployment:

1. **Vercel**: Connect your repo to Vercel for automatic deployments
2. **Netlify**: Connect your repo to Netlify for automatic deployments
3. **GitHub Pages**: Use the build artifacts from GitHub Actions

### Manual Deployment

```bash
# Build for production
pnpm build

# Preview locally
pnpm preview

# Deploy the 'frontend/dist' folder to any static hosting service
```

### Deployment Options

#### Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Vercel will automatically detect the configuration and deploy

#### Netlify
1. Connect your GitHub repo to Netlify
2. Netlify will use the `netlify.toml` configuration

#### Other Platforms
The game is a single-page application that can be hosted on any static file server (GitHub Pages, Firebase, etc.).

### Environment Variables
No environment variables are required for basic functionality.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `pnpm dev`
5. Submit a pull request

## License

This project is for educational purposes. Pokémon names and concept are property of Nintendo/Game Freak.
