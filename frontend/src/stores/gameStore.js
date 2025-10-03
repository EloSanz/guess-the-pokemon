import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Mock Pokemon data - in a real app, this could come from an API
const MOCK_POKEMON = [
  { id: 1, name: 'Pikachu', types: ['Electric'], height: 4, weight: 60, hints: ['Electric mouse', 'Yellow and black', 'Has red cheeks'] },
  { id: 2, name: 'Charizard', types: ['Fire', 'Flying'], height: 17, weight: 905, hints: ['Fire dragon', 'Wings and tail flame', 'Orange and blue'] },
  { id: 3, name: 'Squirtle', types: ['Water'], height: 5, weight: 90, hints: ['Water turtle', 'Blue shell', 'Small and cute'] },
  { id: 4, name: 'Bulbasaur', types: ['Grass', 'Poison'], height: 7, weight: 69, hints: ['Plant dinosaur', 'Green with bulb', 'Leaf on back'] },
  { id: 5, name: 'Eevee', types: ['Normal'], height: 3, weight: 65, hints: ['Fox-like normal type', 'Brown and cream', 'Can evolve into many forms'] },
  { id: 6, name: 'Snorlax', types: ['Normal'], height: 21, weight: 4600, hints: ['Sleeping giant', 'Lazy Pokemon', 'Blocks paths'] },
  { id: 7, name: 'Mewtwo', types: ['Psychic'], height: 20, weight: 1220, hints: ['Genetic Pokemon', 'Purple and gray', 'Very powerful'] },
  { id: 8, name: 'Gyarados', types: ['Water', 'Flying'], height: 65, weight: 2350, hints: ['Sea monster', 'Horns and whiskers', 'Evolves from Magikarp'] },
  { id: 9, name: 'Dragonite', types: ['Dragon', 'Flying'], height: 22, weight: 2100, hints: ['Dragon Pokemon', 'Orange body', 'Very kind despite strength'] },
  { id: 10, name: 'Lucario', types: ['Fighting', 'Steel'], height: 12, weight: 540, hints: ['Aura Pokemon', 'Jackal-like', 'Can sense auras'] },
]

const ROUND_DURATION = 90 // seconds
const HINT_TIMES = [20, 35, 50] // seconds into round
const SCORING_TIERS = [100, 70, 50, 20] // points for 1st, 2nd, 3rd, others
const STREAK_BONUS = 10
const GUESS_COOLDOWN = 2000 // ms

const initialState = {
  // Player state
  player: {
    nickname: '',
    score: 0,
    streak: 0,
    guessesThisRound: 0,
    lastGuessTime: 0,
  },
  isPlaying: false,

  // Game state
  currentRound: null,
  roundTimeRemaining: 0,
  roundStartTime: null,
  revealedHints: [], // Array of revealed hint texts
  usedPokemonIds: [], // Track used Pokemon

  // UI state
  showAuthModal: true,
  gameStarted: false,
}

export const useGameStore = create(
  devtools(
    (set, get) => ({
      ...initialState,

      // Actions
      setPlayer: (player) => set({ player }),

      startGame: () => {
        set({
          gameStarted: true,
          showAuthModal: false,
          isPlaying: true,
        })
        get().startNewRound()
      },

      startNewRound: () => {
        const { usedPokemonIds } = get()

        // Get available Pokemon (avoid recently used ones)
        const availablePokemon = MOCK_POKEMON.filter(
          pokemon => !usedPokemonIds.includes(pokemon.id)
        )

        // If all Pokemon used, reset
        const pokemonPool = availablePokemon.length > 0 ? availablePokemon : MOCK_POKEMON
        const randomPokemon = pokemonPool[Math.floor(Math.random() * pokemonPool.length)]

        // Update used Pokemon list
        const newUsedIds = [...usedPokemonIds, randomPokemon.id]
        if (newUsedIds.length > 5) {
          newUsedIds.shift() // Keep only last 5
        }

        const now = Date.now()
        const round = {
          pokemonId: randomPokemon.id,
          pokemonName: randomPokemon.name,
          hints: randomPokemon.hints,
          startTime: now,
          revealed: false,
        }

        set({
          currentRound: round,
          roundTimeRemaining: ROUND_DURATION,
          roundStartTime: now,
          revealedHints: [],
          usedPokemonIds: newUsedIds,
        })

        // Reset player round state
        set((state) => ({
          player: {
            ...state.player,
            guessesThisRound: 0,
          },
        }))

        // Start timer
        get().startRoundTimer()
      },

      startRoundTimer: () => {
        const interval = setInterval(() => {
          const { roundTimeRemaining, currentRound, revealedHints } = get()

          if (roundTimeRemaining <= 1) {
            clearInterval(interval)
            get().endRound()
            return
          }

          // Check for hint reveals
          const elapsed = ROUND_DURATION - roundTimeRemaining + 1
          HINT_TIMES.forEach((hintTime, index) => {
            if (elapsed === hintTime && revealedHints.length <= index) {
              set((state) => ({
                revealedHints: [...state.revealedHints, currentRound.hints[index]],
              }))
            }
          })

          set((state) => ({
            roundTimeRemaining: state.roundTimeRemaining - 1,
          }))
        }, 1000)
      },

      submitGuess: (guess) => {
        const { player, currentRound, roundTimeRemaining } = get()

        if (!currentRound || currentRound.revealed) return

        const now = Date.now()
        const timeSinceLastGuess = now - player.lastGuessTime

        if (timeSinceLastGuess < GUESS_COOLDOWN) return

        // Normalize guess
        const normalizedGuess = guess.toLowerCase().trim()
        const normalizedAnswer = currentRound.pokemonName.toLowerCase()

        const isCorrect = normalizedGuess === normalizedAnswer

        if (isCorrect) {
          // Calculate score based on position (simplified - always first place in single player)
          const basePoints = SCORING_TIERS[0]
          const streakBonus = player.streak * STREAK_BONUS
          const totalPoints = basePoints + streakBonus

          set((state) => ({
            player: {
              ...state.player,
              score: state.player.score + totalPoints,
              streak: state.player.streak + 1,
              lastGuessTime: now,
            },
            currentRound: {
              ...state.currentRound,
              revealed: true,
            },
          }))

          // End round after a delay
          setTimeout(() => {
            get().startNewRound()
          }, 3000)

        } else {
          // Wrong guess penalty
          const penalty = Math.min(5, player.score) // Max 5 points penalty

          set((state) => ({
            player: {
              ...state.player,
              score: Math.max(0, state.player.score - penalty),
              streak: 0, // Reset streak
              guessesThisRound: state.player.guessesThisRound + 1,
              lastGuessTime: now,
            },
          }))
        }
      },

      endRound: () => {
        const { currentRound } = get()

        if (currentRound && !currentRound.revealed) {
          set((state) => ({
            currentRound: {
              ...state.currentRound,
              revealed: true,
            },
          }))

          // Start new round after delay
          setTimeout(() => {
            get().startNewRound()
          }, 5000)
        }
      },

      setPlayerName: (nickname) => {
        set((state) => ({
          player: {
            ...state.player,
            nickname: nickname.trim(),
          },
        }))
      },

      // Computed values
      get canGuess: () => {
        const { player, currentRound, roundTimeRemaining } = get()
        if (!currentRound || currentRound.revealed) return false

        const now = Date.now()
        const timeSinceLastGuess = now - player.lastGuessTime

        return timeSinceLastGuess >= GUESS_COOLDOWN
      },

      get guessCooldownRemaining: () => {
        const { player } = get()
        const now = Date.now()
        const timeSinceLastGuess = now - player.lastGuessTime
        return Math.max(0, GUESS_COOLDOWN - timeSinceLastGuess)
      },

      // Reset functions
      reset: () => set(initialState),
    }),
    {
      name: 'game-store',
    }
  )
)
