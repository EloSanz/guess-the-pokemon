import { useGameStore } from '@/stores/gameStore'
import { useSocket } from '@/hooks/useSocket'
import GameCard from '@/components/GameCard'
import GuessInput from '@/components/GuessInput'
import RoundTimer from '@/components/RoundTimer'
import StatsPanel from '@/components/StatsPanel'
import AdminPanel from '@/components/AdminPanel'

export default function GamePage() {
  const { player, currentRound, roundTimeRemaining, isConnected, connectionError, showAdminPanel } = useGameStore()
  const { isAdmin } = useSocket()

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4"></div>
            <p className="text-lg">Connecting to server...</p>
            {connectionError && (
              <p className="text-sm text-red-500 mt-2">{connectionError}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎮 Guess the Pokémon
            </h1>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button
                  onClick={() => useGameStore.getState().toggleAdminPanel()}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Admin Panel
                </button>
              )}
              {player && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium">{player.nickname}</span>
                  {isAdmin && <span className="text-red-500 font-bold">👑 ADMIN</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="container mx-auto px-4 py-8">
        {showAdminPanel && isAdmin && (
          <div className="mb-8">
            <AdminPanel />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Stats & Admin */}
          <div className="lg:col-span-1 space-y-4">
            <StatsPanel />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Round Timer */}
            {currentRound && roundTimeRemaining > 0 && <RoundTimer />}

            {/* Game Card */}
            <GameCard />

            {/* Guess Input */}
            {currentRound && !currentRound.revealed && (
              <GuessInput />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
