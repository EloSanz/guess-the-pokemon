import { useGameStore } from '@/stores/gameStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Leaderboard() {
  const { game, me, myPosition } = useGameStore()
  const { leaderboard } = game

  const getMedal = (position) => {
    switch (position) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${position}`
    }
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboard.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No players yet
          </p>
        ) : (
          <>
            {leaderboard.slice(0, 10).map((player, index) => {
              const position = index + 1
              const isMe = me && player.id === me.id

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isMe
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold w-8 text-center">
                      {getMedal(position)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${
                        isMe ? 'text-primary' : ''
                      }`}>
                        {player.nickname}
                        {isMe && <span className="ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Streak: {player.streak}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{player.score}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              )
            })}

            {/* Show my position if not in top 10 */}
            {myPosition && myPosition > 10 && (
              <>
                <div className="border-t my-3"></div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold w-8 text-center">
                      #{myPosition}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-primary truncate">
                        {me.nickname} (You)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Streak: {me.streak}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{me.score}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
