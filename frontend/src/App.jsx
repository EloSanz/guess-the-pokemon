import { Toaster } from '@/components/ui/toaster'
import GamePage from '@/pages/GamePage'
import AuthModal from '@/components/AuthModal'
import { useGameStore } from '@/stores/gameStore'

function App() {
  const { showAuthModal } = useGameStore()

  return (
    <div className="min-h-screen bg-background">
      <GamePage />
      {showAuthModal && <AuthModal />}
      <Toaster />
    </div>
  )
}

export default App
