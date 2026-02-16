'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[SOCKET] Connected:', socket.id)
      setIsConnected(true)
    })

    socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('[SOCKET] Connection error:', error.message)
      setIsConnected(false)
    })

    socket.on('pong', (data: { timestamp: number }) => {
      const latency = Date.now() - data.timestamp
      console.log('[SOCKET] Latency:', latency, 'ms')
    })

    // Heartbeat
    const heartbeat = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping')
      }
    }, 30000)

    return () => {
      clearInterval(heartbeat)
      socket.disconnect()
    }
  }, [])

  const joinMatch = useCallback((matchId: string) => {
    socketRef.current?.emit('match:join', { matchId })
  }, [])

  const leaveMatch = useCallback(() => {
    socketRef.current?.emit('match:leave')
  }, [])

  const spectate = useCallback((matchId: string) => {
    socketRef.current?.emit('spectate:join', { matchId })
  }, [])

  const stopSpectating = useCallback((matchId: string) => {
    socketRef.current?.emit('spectate:leave', { matchId })
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    joinMatch,
    leaveMatch,
    spectate,
    stopSpectating,
  }
}
