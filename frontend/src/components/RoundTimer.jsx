import { useGameStore } from '@/stores/gameStore'

const ROUND_DURATION = 90

export default function RoundTimer() {
  const { roundTimeRemaining, currentRound } = useGameStore()

  if (!currentRound || roundTimeRemaining <= 0) return null

  const minutes = Math.floor(roundTimeRemaining / 60)
  const seconds = roundTimeRemaining % 60
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`

  // Progress bar calculation
  const progress = ((ROUND_DURATION - roundTimeRemaining) / ROUND_DURATION) * 100

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Time Remaining</span>
          <span className="text-lg font-bold">{timeString}</span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              progress < 30 ? 'bg-green-500' :
              progress < 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Start</span>
          <span>End</span>
        </div>
      </div>
    </div>
  )
}
