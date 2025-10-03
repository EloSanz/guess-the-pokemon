import { useGameStore } from '@/stores/gameStore'
import { Card, CardContent } from '@/components/ui/card'

export default function GameCard() {
  const { currentRound, revealedHints } = useGameStore()

  if (!currentRound) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">
            <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4"></div>
            <p className="text-muted-foreground">Waiting for next round...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto overflow-hidden">
      <CardContent className="p-6">
        {/* Pokemon Silhouette */}
        <div className="relative w-48 h-48 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {currentRound.revealed ? (
            <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-600 dark:to-yellow-800 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {currentRound.pokemonName}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
              <div className="text-6xl opacity-20">?</div>
            </div>
          )}
        </div>

        {/* Hints */}
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Hints</h3>
          </div>

          {/* Revealed Hints */}
          {revealedHints.map((hint, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg text-center ${
                index === 0 ? 'bg-blue-50 dark:bg-blue-900/20' :
                index === 1 ? 'bg-green-50 dark:bg-green-900/20' :
                'bg-purple-50 dark:bg-purple-900/20'
              }`}
            >
              <div className="text-sm font-medium">{hint}</div>
            </div>
          ))}

          {/* Upcoming Hints */}
          {revealedHints.length < 3 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">
                More hints will be revealed soon...
              </div>
            </div>
          )}

          {/* Answer Reveal */}
          {currentRound.revealed && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center border-2 border-yellow-200 dark:border-yellow-800">
              <div className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                🎉 Correct! 🎉
              </div>
              <div className="text-lg font-semibold">
                It was {currentRound.pokemonName}!
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
