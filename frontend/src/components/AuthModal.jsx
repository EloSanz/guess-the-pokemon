import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGameStore } from '@/stores/gameStore'
import { useSocket } from '@/hooks/useSocket'

export default function AuthModal() {
  const [nickname, setNickname] = useState('')
  const { setPlayerName } = useGameStore()
  const { joinGame, isConnected } = useSocket()

  // Load saved nickname from localStorage
  useEffect(() => {
    const savedNickname = localStorage.getItem('pokemon-game-nickname')
    if (savedNickname) {
      setNickname(savedNickname)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!nickname.trim() || nickname.length < 3 || nickname.length > 16 || !isConnected) {
      return
    }

    // Save nickname to localStorage
    localStorage.setItem('pokemon-game-nickname', nickname.trim())

    // Set player name and join game
    const cleanNickname = nickname.trim()
    setPlayerName(cleanNickname)
    joinGame(cleanNickname)
  }

  const isValidNickname = nickname.length >= 3 && nickname.length <= 16

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            🎮 Guess the Pokémon
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter your nickname to start playing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-medium">
              Nickname
            </label>
            <Input
              id="nickname"
              type="text"
              placeholder="Enter your nickname (3-16 characters)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={16}
              autoFocus
            />
            {nickname && !isValidNickname && (
              <p className="text-sm text-destructive">
                Nickname must be 3-16 characters long
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isValidNickname || !isConnected}
          >
            {isConnected ? 'Join Game' : 'Connecting...'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
