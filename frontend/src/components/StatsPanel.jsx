import { useGameStore } from '@/stores/gameStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StatsPanel() {
  const { player, revealedHints, guessCooldownRemaining, canGuess } = useGameStore()

  if (!player) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{player.score}</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{player.streak}</div>
            <div className="text-sm text-muted-foreground">Streak</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Hints Revealed</h4>
          <div className="space-y-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`text-xs p-2 rounded ${
                  revealedHints.length > index
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                Hint {index + 1}: {revealedHints[index] || 'Not revealed yet'}
              </div>
            ))}
          </div>
        </div>

        {!canGuess && guessCooldownRemaining > 0 && (
          <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
            <div className="text-sm font-medium">Cooldown</div>
            <div className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
              {guessCooldownRemaining}s
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
