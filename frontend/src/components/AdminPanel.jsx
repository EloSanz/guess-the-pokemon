import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useGameStore } from '@/stores/gameStore'
import { useSocket } from '@/hooks/useSocket'

export default function AdminPanel() {
  const { isAdminConnected, currentRound } = useGameStore()
  const { isAdmin, adminLogin, adminLogout, revealHint, revealAnswer, startRound } = useSocket()
  const [password, setPassword] = useState('')
  const [showLogin, setShowLogin] = useState(!isAdmin)

  const handleLogin = (e) => {
    e.preventDefault()
    if (password.trim()) {
      adminLogin(password.trim())
      setPassword('')
    }
  }

  const handleLogout = () => {
    adminLogout()
    setShowLogin(true)
  }

  if (showLogin && !isAdmin) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Login as Admin
            </Button>
          </form>
          <Button
            variant="outline"
            onClick={() => setShowLogin(false)}
            className="w-full mt-2"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!isAdmin) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <Button
            onClick={() => setShowLogin(true)}
            className="w-full"
            variant="outline"
          >
            🔑 Admin Panel
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-between">
          <span>🎮 Admin Panel</span>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
          >
            Logout
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          Status: {isAdminConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>

        {!currentRound && (
          <Button
            onClick={startRound}
            className="w-full"
            disabled={!isAdminConnected}
          >
            🎯 Start New Round
          </Button>
        )}

        {currentRound && !currentRound.revealed && (
          <>
            <Button
              onClick={revealHint}
              className="w-full"
              variant="secondary"
              disabled={!isAdminConnected}
            >
              💡 Reveal Next Hint
            </Button>

            <Button
              onClick={revealAnswer}
              className="w-full"
              variant="destructive"
              disabled={!isAdminConnected}
            >
              🎉 Reveal Answer
            </Button>
          </>
        )}

        {currentRound?.revealed && (
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm font-medium">
              ✅ Round Complete
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Next round will start automatically
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
