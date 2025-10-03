import { gameState, startNewRound, shouldRevealHint, revealNextHint, revealAnswer, resetRoundState } from './gameState.js'

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

function sendGameState(io, socket = null) {
  const stateToSend = {
    currentRound: gameState.currentRound,
    revealedHints: gameState.revealedHints,
    roundStartTime: gameState.roundStartTime,
    isAdminConnected: gameState.isAdminConnected,
    playerCount: gameState.players.size,
  }

  if (socket) {
    socket.emit(EVENTS.GAME_STATE, { state: stateToSend })
  } else {
    io.emit(EVENTS.GAME_STATE, { state: stateToSend })
  }
}

function handleJoinGame(socket, data) {
  try {
    const { nickname } = data

    if (!nickname || nickname.trim().length < 3 || nickname.trim().length > 16) {
      socket.emit(EVENTS.ERROR, { message: 'Invalid nickname (3-16 characters)' })
      return
    }

    // Check for duplicate nicknames
    const existingPlayer = Array.from(gameState.players.values()).find(
      player => player.nickname.toLowerCase() === nickname.toLowerCase()
    )

    if (existingPlayer && existingPlayer.socketId !== socket.id) {
      socket.emit(EVENTS.ERROR, { message: 'Nickname already taken' })
      return
    }

    // Create or update player
    const player = {
      socketId: socket.id,
      nickname: nickname.trim(),
      joinedAt: Date.now(),
    }

    gameState.players.set(socket.id, player)

    // Notify all clients
    io.emit(EVENTS.PLAYER_JOINED, { nickname: player.nickname })

    // Send current game state to new player
    sendGameState(io, socket)

    console.log(`Player ${player.nickname} joined (${gameState.players.size} total players)`)
  } catch (error) {
    console.error('Error handling join game:', error)
    socket.emit(EVENTS.ERROR, { message: 'Failed to join game' })
  }
}

function handleSubmitGuess(socket, data) {
  try {
    const { guess } = data
    const player = gameState.players.get(socket.id)

    if (!player) {
      socket.emit(EVENTS.ERROR, { message: 'Player not found' })
      return
    }

    if (!gameState.currentRound || gameState.currentRound.revealed) {
      socket.emit(EVENTS.ERROR, { message: 'No active round to guess in' })
      return
    }

    // Normalize guess
    const normalizedGuess = guess.toLowerCase().trim()
    const normalizedAnswer = gameState.currentRound.pokemonName.toLowerCase()

    if (normalizedGuess === normalizedAnswer) {
      // Correct guess - reveal answer for all
      const answer = revealAnswer()
      io.emit(EVENTS.ANSWER_REVEALED, {
        answer,
        correctPlayer: player.nickname
      })

      // Schedule next round
      setTimeout(() => {
        resetRoundState()
        startNewRound()
        io.emit(EVENTS.ROUND_START, {
          pokemonId: gameState.currentRound.pokemonId,
          hints: gameState.currentRound.hints,
        })
        sendGameState(io)
      }, 3000)

    } else {
      // Wrong guess - just notify the player
      socket.emit(EVENTS.ERROR, { message: 'Wrong guess! Try again.' })
    }
  } catch (error) {
    console.error('Error handling guess:', error)
    socket.emit(EVENTS.ERROR, { message: 'Failed to process guess' })
  }
}

function handleAdminLogin(socket, data) {
  try {
    const { password } = data
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

    if (password !== ADMIN_PASSWORD) {
      socket.emit(EVENTS.ERROR, { message: 'Invalid admin password' })
      return
    }

    // If there's already an admin, disconnect them
    if (gameState.adminSocketId) {
      const oldAdminSocket = io.sockets.sockets.get(gameState.adminSocketId)
      if (oldAdminSocket) {
        oldAdminSocket.emit(EVENTS.ERROR, { message: 'Admin disconnected - another admin logged in' })
      }
    }

    gameState.adminSocketId = socket.id
    gameState.isAdminConnected = true

    // Send admin capabilities to the socket
    socket.emit(EVENTS.ADMIN_CONNECTED)

    // Notify all clients
    io.emit(EVENTS.ADMIN_CONNECTED)

    console.log('Admin connected')

  } catch (error) {
    console.error('Error handling admin login:', error)
    socket.emit(EVENTS.ERROR, { message: 'Failed to login as admin' })
  }
}

function handleAdminLogout(socket) {
  if (gameState.adminSocketId === socket.id) {
    gameState.adminSocketId = null
    gameState.isAdminConnected = false

    io.emit(EVENTS.ADMIN_DISCONNECTED)
    console.log('Admin disconnected')
  }
}

function handleAdminRevealHint(socket) {
  if (gameState.adminSocketId !== socket.id) {
    socket.emit(EVENTS.ERROR, { message: 'Not authorized' })
    return
  }

  if (!gameState.currentRound || gameState.currentRound.revealed) {
    socket.emit(EVENTS.ERROR, { message: 'No active round' })
    return
  }

  const hint = revealNextHint()
  if (hint) {
    io.emit(EVENTS.HINT_REVEALED, {
      hint,
      hintIndex: gameState.revealedHints.length - 1,
    })
  } else {
    socket.emit(EVENTS.ERROR, { message: 'No more hints to reveal' })
  }
}

function handleAdminRevealAnswer(socket) {
  if (gameState.adminSocketId !== socket.id) {
    socket.emit(EVENTS.ERROR, { message: 'Not authorized' })
    return
  }

  if (!gameState.currentRound || gameState.currentRound.revealed) {
    socket.emit(EVENTS.ERROR, { message: 'No active round' })
    return
  }

  const answer = revealAnswer()
  io.emit(EVENTS.ANSWER_REVEALED, { answer })

  // Schedule next round
  setTimeout(() => {
    resetRoundState()
    startNewRound()
    io.emit(EVENTS.ROUND_START, {
      pokemonId: gameState.currentRound.pokemonId,
      hints: gameState.currentRound.hints,
    })
    sendGameState(io)
  }, 3000)
}

function handleAdminStartRound(socket) {
  if (gameState.adminSocketId !== socket.id) {
    socket.emit(EVENTS.ERROR, { message: 'Not authorized' })
    return
  }

  if (gameState.currentRound) {
    socket.emit(EVENTS.ERROR, { message: 'Round already active' })
    return
  }

  startNewRound()
  io.emit(EVENTS.ROUND_START, {
    pokemonId: gameState.currentRound.pokemonId,
    hints: gameState.currentRound.hints,
  })
  sendGameState(io)
}

function handleDisconnect(socket) {
  const player = gameState.players.get(socket.id)

  if (player) {
    gameState.players.delete(socket.id)
    io.emit(EVENTS.PLAYER_LEFT, { nickname: player.nickname })
    console.log(`Player ${player.nickname} disconnected`)
  }

  // Handle admin disconnect
  if (gameState.adminSocketId === socket.id) {
    gameState.adminSocketId = null
    gameState.isAdminConnected = false
    io.emit(EVENTS.ADMIN_DISCONNECTED)
    console.log('Admin disconnected')
  }
}

// Game loop for automatic hint reveals
setInterval(() => {
  if (shouldRevealHint()) {
    const hint = revealNextHint()
    if (hint) {
      io.emit(EVENTS.HINT_REVEALED, {
        hint,
        hintIndex: gameState.revealedHints.length - 1,
      })
    }
  }
}, 1000)

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`)

    // Send initial state
    sendGameState(io, socket)

    // Handle events
    socket.on(EVENTS.JOIN_GAME, (data) => handleJoinGame(socket, data))
    socket.on(EVENTS.SUBMIT_GUESS, (data) => handleSubmitGuess(socket, data))
    socket.on(EVENTS.ADMIN_LOGIN, (data) => handleAdminLogin(socket, data))
    socket.on(EVENTS.ADMIN_LOGOUT, () => handleAdminLogout(socket))
    socket.on(EVENTS.ADMIN_REVEAL_HINT, () => handleAdminRevealHint(socket))
    socket.on(EVENTS.ADMIN_REVEAL_ANSWER, () => handleAdminRevealAnswer(socket))
    socket.on(EVENTS.ADMIN_START_ROUND, () => handleAdminStartRound(socket))

    // Handle disconnect
    socket.on('disconnect', () => handleDisconnect(socket))

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error)
    })
  })
}
