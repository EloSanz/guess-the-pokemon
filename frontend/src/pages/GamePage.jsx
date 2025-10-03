import { useGameStore } from '@/stores/gameStore'
import GameCard from '@/components/GameCard'
import GuessInput from '@/components/GuessInput'
import RoundTimer from '@/components/RoundTimer'
import StatsPanel from '@/components/StatsPanel'

export default function GamePage() {
  const { gameStarted, player, currentRound, roundTimeRemaining } = useGameStore()

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4"></div>
            <p className="text-lg">Loading game...</p>
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
            {player && (
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium">{player.nickname}</span>
                <span className="text-muted-foreground">
                  Score: {player.score} | Streak: {player.streak}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1">
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
