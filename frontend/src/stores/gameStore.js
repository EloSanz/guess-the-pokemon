import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const initialState = {
  // Player state
  player: {
    nickname: '',
    joinedAt: null,
  },

  // Game state from server
  currentRound: null, // { pokemonId, pokemonName, hints, startTime, revealed }
  revealedHints: [], // Array of revealed hint texts
  roundStartTime: null,
  roundTimeRemaining: 0,

  // Connection state
  isConnected: false,
  connectionError: null,

  // UI state
  showAuthModal: true,
  showAdminPanel: false,

  // Server state
  playerCount: 0,
  isAdminConnected: false,
}

export const useGameStore = create(
  devtools(
    (set, get) => ({
      ...initialState,

      // Actions
      setPlayer: (player) => set({ player }),

      setConnectionStatus: (isConnected, error = null) => set({
        isConnected,
        connectionError: error,
      }),

      updateGameState: (serverState) => {
        set({
          currentRound: serverState.currentRound,
          revealedHints: serverState.revealedHints || [],
          roundStartTime: serverState.roundStartTime,
          playerCount: serverState.playerCount || 0,
          isAdminConnected: serverState.isAdminConnected || false,
        })

        // Update timer if we have round start time
        if (serverState.roundStartTime) {
          const elapsed = Math.floor((Date.now() - serverState.roundStartTime) / 1000)
          const remaining = Math.max(0, 90 - elapsed)
          set({ roundTimeRemaining: remaining })

          // Start countdown timer
          get().startTimer()
        }
      },

      startTimer: () => {
        // Clear any existing timer
        if (get().timerInterval) {
          clearInterval(get().timerInterval)
        }

        const interval = setInterval(() => {
          const { roundTimeRemaining } = get()
          if (roundTimeRemaining <= 1) {
            clearInterval(interval)
            set({ roundTimeRemaining: 0 })
          } else {
            set((state) => ({ roundTimeRemaining: state.roundTimeRemaining - 1 }))
          }
        }, 1000)

        // Store interval ID (this is a bit of a hack, but works)
        set({ timerInterval: interval })
      },

      updateRoundTime: (timeRemaining) => set({ roundTimeRemaining: timeRemaining }),

      revealHint: (hintData) => set((state) => ({
        revealedHints: [...state.revealedHints, hintData.hint],
      })),

      revealAnswer: (answerData) => set((state) => ({
        currentRound: state.currentRound ? {
          ...state.currentRound,
          revealed: true,
          pokemonName: answerData.answer,
        } : null,
      })),

      startRound: (roundData) => set({
        currentRound: {
          pokemonId: roundData.pokemonId,
          hints: roundData.hints,
          startTime: Date.now(),
          revealed: false,
        },
        roundStartTime: Date.now(),
        revealedHints: [],
        roundTimeRemaining: 90,
      }),

      setPlayerName: (nickname) => set((state) => ({
        player: { ...state.player, nickname },
        showAuthModal: false,
      })),

      toggleAdminPanel: () => set((state) => ({
        showAdminPanel: !state.showAdminPanel,
      })),

      // Computed getters
      get canGuess() {
        const { currentRound, roundTimeRemaining } = get()
        return currentRound && !currentRound.revealed && roundTimeRemaining > 0
      },

      // Reset function
      reset: () => set(initialState),
    }),
    { name: 'game-store' }
  )
)
