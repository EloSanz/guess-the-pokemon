import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

// Socket event constants
const EVENTS = {
  // Client to Server
  JOIN_GAME: 'join_game',
  SUBMIT_GUESS: 'submit_guess',
  ADMIN_LOGIN: 'admin_login',
  ADMIN_LOGOUT: 'admin_logout',
  ADMIN_REVEAL_HINT: 'admin_reveal_hint',
  ADMIN_REVEAL_ANSWER: 'admin_reveal_answer',
  ADMIN_START_ROUND: 'admin_start_round',

  // Server to Client
  GAME_STATE: 'game_state',
  ROUND_START: 'round_start',
  HINT_REVEALED: 'hint_revealed',
  ANSWER_REVEALED: 'answer_revealed',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  ADMIN_CONNECTED: 'admin_connected',
  ADMIN_DISCONNECTED: 'admin_disconnected',
  ERROR: 'error',
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export function useSocket() {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [connectionError, setConnectionError] = useState(null)

  const {
    setConnectionStatus,
    updateGameState,
    updateRevealHint: revealHint,
    updateRevealAnswer: revealAnswer,
    updateStartRound: startRound,
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
      setIsConnected(true)
      setConnectionError(null)
      setConnectionStatus(true)
    })

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason)
      setIsConnected(false)
      setIsAdmin(false)
      setConnectionStatus(false)
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        socket.connect()
      }
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setConnectionError(error.message)
      setIsConnected(false)
      setConnectionStatus(false, error.message)
    })

    // Game state events
    socket.on(EVENTS.GAME_STATE, (data) => {
      console.log('Received game state:', data)
      updateGameState(data.state)
    })

    socket.on(EVENTS.ROUND_START, (data) => {
      console.log('Round started:', data)
      startRound(data)
    })

    socket.on(EVENTS.HINT_REVEALED, (data) => {
      console.log('Hint revealed:', data)
      revealHint(data)
    })

    socket.on(EVENTS.ANSWER_REVEALED, (data) => {
      console.log('Answer revealed:', data)
      revealAnswer(data)
    })

    socket.on(EVENTS.PLAYER_JOINED, (data) => {
      console.log('Player joined:', data.nickname)
      // Could show notification
    })

    socket.on(EVENTS.PLAYER_LEFT, (data) => {
      console.log('Player left:', data.nickname)
      // Could show notification
    })

    // Admin events
    socket.on(EVENTS.ADMIN_CONNECTED, () => {
      console.log('Admin connected')
      setIsAdmin(true)
    })

    socket.on(EVENTS.ADMIN_DISCONNECTED, () => {
      console.log('Admin disconnected')
      setIsAdmin(false)
    })

    // Error handling
    socket.on(EVENTS.ERROR, (data) => {
      console.error('Server error:', data.message)
      // Could emit toast notification here
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [])

  // Join game function
  const joinGame = (nickname) => {
    if (!socketRef.current) return

    socketRef.current.emit(EVENTS.JOIN_GAME, { nickname })
  }

  // Guess submission
  const submitGuess = (guess) => {
    if (!socketRef.current) return

    socketRef.current.emit(EVENTS.SUBMIT_GUESS, { guess })
  }

  // Admin functions
  const adminLogin = (password) => {
    if (!socketRef.current) return

    socketRef.current.emit(EVENTS.ADMIN_LOGIN, { password })
  }

  const adminLogout = () => {
    if (!socketRef.current) return

    socketRef.current.emit(EVENTS.ADMIN_LOGOUT)
    setIsAdmin(false)
  }

  const sendRevealHint = () => {
    if (!socketRef.current || !isAdmin) return

    socketRef.current.emit(EVENTS.ADMIN_REVEAL_HINT)
  }

  const sendRevealAnswer = () => {
    if (!socketRef.current || !isAdmin) return

    socketRef.current.emit(EVENTS.ADMIN_REVEAL_ANSWER)
  }

  const sendStartRound = () => {
    if (!socketRef.current || !isAdmin) return

    socketRef.current.emit(EVENTS.ADMIN_START_ROUND)
  }

  return {
    socket: socketRef.current,
    isConnected,
    isAdmin,
    connectionError,
    joinGame,
    submitGuess,
    adminLogin,
    adminLogout,
    sendRevealHint,
    sendRevealAnswer,
    sendStartRound,
  }
}
