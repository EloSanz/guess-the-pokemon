import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useGameStore } from '@/stores/gameStore'
import { SOCKET_EVENTS } from '../../../shared/types.js'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export function useSocket() {
  const socketRef = useRef(null)
  const {
    isConnected,
    setConnected,
    setConnectionError,
    updateGameState,
    setCurrentRound,
    updatePlayers,
    updateLeaderboard,
    addMessage,
    setRoundTimeRemaining,
    setGameActive,
    me,
  } = useGameStore()

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
    })

    const socket = socketRef.current

    // Connection handlers
    socket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
    })

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason)
      setConnected(false)
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        socket.connect()
      }
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setConnectionError(error.message)
    })

    // Game state handlers
    socket.on(SOCKET_EVENTS.GAME_STATE, (data) => {
      console.log('Received game state:', data)
      updateGameState(data.state)
    })

    socket.on(SOCKET_EVENTS.ROUND_TICK, (data) => {
      setRoundTimeRemaining(data.timeRemaining)
    })

    socket.on(SOCKET_EVENTS.ROUND_REVEAL, (data) => {
      // Update round with new hint or answer
      setCurrentRound((currentRound) => {
        if (!currentRound) return null
        return {
          ...currentRound,
          hintIndex: data.hintIndex,
          revealed: data.type === 'answer',
        }
      })
    })

    socket.on(SOCKET_EVENTS.LEADERBOARD_UPDATE, (data) => {
      updateLeaderboard(data.leaderboard)
    })

    socket.on(SOCKET_EVENTS.PLAYER_JOINED, (data) => {
      addMessage({
        id: `join-${Date.now()}`,
        nickname: 'System',
        message: `${data.nickname} joined the game`,
        timestamp: Date.now(),
        type: 'system',
      })
    })

    socket.on(SOCKET_EVENTS.PLAYER_LEFT, (data) => {
      addMessage({
        id: `leave-${Date.now()}`,
        nickname: 'System',
        message: `${data.nickname} left the game`,
        timestamp: Date.now(),
        type: 'system',
      })
    })

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (data) => {
      addMessage({
        id: data.id,
        nickname: data.nickname,
        message: data.message,
        timestamp: data.timestamp,
        type: data.type,
      })
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [])

  // Join game function
  const joinGame = (nickname, roomCode = null) => {
    if (!socketRef.current) return

    socketRef.current.emit(SOCKET_EVENTS.GAME_JOIN, {
      nickname,
      roomCode,
    })
  }

  // Guess submission
  const submitGuess = (guess) => {
    if (!socketRef.current || !me) return

    socketRef.current.emit(SOCKET_EVENTS.GUESS_SUBMIT, {
      guess: guess.trim(),
    })
  }

  // Chat message
  const sendChatMessage = (message) => {
    if (!socketRef.current || !me) return

    socketRef.current.emit(SOCKET_EVENTS.CHAT_MESSAGE, {
      message: message.trim(),
    })
  }

  return {
    socket: socketRef.current,
    isConnected,
    joinGame,
    submitGuess,
    sendChatMessage,
  }
}
