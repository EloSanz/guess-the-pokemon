import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGameStore } from '@/stores/gameStore'

export default function GuessInput() {
  const [guess, setGuess] = useState('')
  const { submitGuess, canGuess, guessCooldownRemaining } = useGameStore()

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!guess.trim() || !canGuess) return

    submitGuess(guess.trim())
    setGuess('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Guess the Pokémon..."
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={50}
            disabled={!canGuess}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!canGuess || !guess.trim()}
            className="px-6"
          >
            Guess
          </Button>
        </div>

        {!canGuess && guessCooldownRemaining > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Cooldown: {guessCooldownRemaining} seconds remaining
          </p>
        )}
      </form>
    </div>
  )
}
