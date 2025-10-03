import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGameStore } from '@/stores/gameStore'
import { useSocket } from '@/hooks/useSocket'
import { Send } from 'lucide-react'

export default function ChatDock() {
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const scrollAreaRef = useRef(null)
  const { game, me } = useGameStore()
  const { sendChatMessage } = useSocket()
  const { recentMessages } = game

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [recentMessages])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!message.trim()) return

    sendChatMessage(message.trim())
    setMessage('')
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canSendMessage = message.trim().length > 0 && message.trim().length <= 200

  return (
    <Card className="h-fit">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-lg flex items-center justify-between">
          <span>💬 Chat</span>
          <span className="text-sm font-normal text-muted-foreground">
            ({recentMessages.length})
          </span>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          {/* Messages */}
          <ScrollArea className="h-64 p-4" ref={scrollAreaRef}>
            <div className="space-y-3">
              {recentMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No messages yet. Be the first to say something!
                </p>
              ) : (
                recentMessages.slice().reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${
                      msg.type === 'system' ? 'justify-center' : ''
                    }`}
                  >
                    {msg.type === 'system' ? (
                      <div className="bg-muted/50 px-3 py-1 rounded-full text-xs text-muted-foreground">
                        {msg.message}
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium truncate">
                              {msg.nickname}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm break-words">{msg.message}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={200}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!canSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/200 characters
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
