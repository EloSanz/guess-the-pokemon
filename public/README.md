# Pokemon Assets

This directory contains the visual assets for the Guess the Pokemon game.

## Directory Structure

```
public/
├── silhouettes/     # Black silhouette images (PNG)
├── sprites/         # Full color Pokemon sprites (PNG)
└── pixelated/       # 16x16 pixelated versions (PNG)
```

## File Naming Convention

- **Silhouettes**: `{pokemonId}.png` (e.g., `1.png`, `25.png`)
- **Sprites**: `{pokemonId}.png` (e.g., `1.png`, `25.png`)
- **Pixelated**: `{pokemonId}.png` (e.g., `1.png`, `25.png`)

## How to Add Pokemon

1. **Add the Pokemon data** to `backend/gameLoop.js` in the `MOCK_POKEMON` array
2. **Add silhouette image** to `public/silhouettes/{id}.png`
3. **Add sprite image** to `public/sprites/{id}.png`
4. **Generate pixelated version** (optional, can be auto-generated)

## Image Requirements

- **Silhouettes**: Black shapes on transparent background, ~200x200px
- **Sprites**: Full color Pokemon sprites, ~200x200px
- **Pixelated**: 16x16 pixel art versions

## Asset Generation

You can use the script in `scripts/generate-silhouettes.js` to automatically generate silhouette images from sprite images using Node.js and Sharp.

```bash
cd backend
node scripts/generate-silhouettes.js
```

## Legal Notice

Please ensure you have proper licensing for any Pokemon images used in this project. This is for educational purposes only.
