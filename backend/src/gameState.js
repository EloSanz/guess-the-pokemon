// Mock Pokemon data
const MOCK_POKEMON = [
  { id: 1, name: 'Pikachu', types: ['Electric'], hints: ['Electric mouse', 'Yellow and black', 'Has red cheeks'] },
  { id: 2, name: 'Charizard', types: ['Fire', 'Flying'], hints: ['Fire dragon', 'Wings and tail flame', 'Orange and blue'] },
  { id: 3, name: 'Squirtle', types: ['Water'], hints: ['Water turtle', 'Blue shell', 'Small and cute'] },
  { id: 4, name: 'Bulbasaur', types: ['Grass', 'Poison'], hints: ['Plant dinosaur', 'Green with bulb', 'Leaf on back'] },
  { id: 5, name: 'Eevee', types: ['Normal'], hints: ['Fox-like normal type', 'Brown and cream', 'Can evolve into many forms'] },
  { id: 6, name: 'Snorlax', types: ['Normal'], hints: ['Sleeping giant', 'Lazy Pokemon', 'Blocks paths'] },
  { id: 7, name: 'Mewtwo', types: ['Psychic'], hints: ['Genetic Pokemon', 'Purple and gray', 'Very powerful'] },
  { id: 8, name: 'Gyarados', types: ['Water', 'Flying'], hints: ['Sea monster', 'Horns and whiskers', 'Evolves from Magikarp'] },
  { id: 9, name: 'Dragonite', types: ['Dragon', 'Flying'], hints: ['Dragon Pokemon', 'Orange body', 'Very kind despite strength'] },
  { id: 10, name: 'Lucario', types: ['Fighting', 'Steel'], hints: ['Aura Pokemon', 'Jackal-like', 'Can sense auras'] },
]

// Game configuration
const GAME_CONFIG = {
  roundDuration: 90, // seconds
  hintRevealTimes: [20, 35, 50], // seconds into round
  scoringTiers: [100, 70, 50, 20], // points for 1st, 2nd, 3rd, others
  streakBonus: 10,
  wrongGuessPenalty: 5,
  guessCooldown: 2000, // ms
}

// Global game state
export const gameState = {
  // Players
  players: new Map(), // socketId -> player

  // Current game state
  currentRound: null,
  roundStartTime: null,
  revealedHints: [], // Array of revealed hint texts
  usedPokemonIds: [], // Track used Pokemon

  // Admin
  adminSocketId: null,
  isAdminConnected: false,

  // Game settings
  config: GAME_CONFIG,
}

// Helper functions
export function getRandomPokemon() {
  const availablePokemon = MOCK_POKEMON.filter(
    pokemon => !gameState.usedPokemonIds.includes(pokemon.id)
  )

  const pokemonPool = availablePokemon.length > 0 ? availablePokemon : MOCK_POKEMON
  return pokemonPool[Math.floor(Math.random() * pokemonPool.length)]
}

export function startNewRound() {
  const pokemon = getRandomPokemon()

  // Update used Pokemon list
  gameState.usedPokemonIds.push(pokemon.id)
  if (gameState.usedPokemonIds.length > 5) {
    gameState.usedPokemonIds.shift() // Keep only last 5
  }

  const now = Date.now()
  gameState.currentRound = {
    pokemonId: pokemon.id,
    pokemonName: pokemon.name,
    hints: pokemon.hints,
    startTime: now,
    revealed: false,
  }

  gameState.roundStartTime = now
  gameState.revealedHints = []

  console.log(`Started new round with ${pokemon.name}`)
}

export function shouldRevealHint() {
  if (!gameState.currentRound || gameState.currentRound.revealed) return false

  const elapsed = Math.floor((Date.now() - gameState.roundStartTime) / 1000)
  const nextHintIndex = gameState.revealedHints.length

  if (nextHintIndex < gameState.config.hintRevealTimes.length) {
    const revealTime = gameState.config.hintRevealTimes[nextHintIndex]
    return elapsed >= revealTime
  }

  return false
}

export function revealNextHint() {
  if (!gameState.currentRound || gameState.currentRound.revealed) return null

  const nextHintIndex = gameState.revealedHints.length
  if (nextHintIndex >= gameState.currentRound.hints.length) return null

  const hint = gameState.currentRound.hints[nextHintIndex]
  gameState.revealedHints.push(hint)

  console.log(`Revealed hint ${nextHintIndex + 1}: ${hint}`)
  return hint
}

export function revealAnswer() {
  if (!gameState.currentRound) return null

  gameState.currentRound.revealed = true
  console.log(`Revealed answer: ${gameState.currentRound.pokemonName}`)
  return gameState.currentRound.pokemonName
}

export function resetRoundState() {
  gameState.currentRound = null
  gameState.roundStartTime = null
  gameState.revealedHints = []
}
