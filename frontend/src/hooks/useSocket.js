/**
 * useSocket — shared WebSocket hook for EduGuard.
 *
 * Creates and manages a Socket.IO connection authenticated via the stored
 * JWT access token. The socket is created once on mount and disconnected
 * on unmount, so callers never need to manage cleanup manually.
 *
 * Usage:
 *   const socket = useSocket()
 *   useEffect(() => {
 *     if (!socket) return
 *     socket.on('risk_update', handler)
 *     return () => socket.off('risk_update', handler)
 *   }, [socket])
 */
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export default function useSocket() {
  const [socket, setSocket] = useState(null)
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    // Connect to the same origin the Vite dev proxy points to (port 5000 via /api proxy,
    // but for WS we connect directly). Vite's proxy does not forward WS upgrades for
    // socket.io polling+upgrade by default, so we target the Flask port explicitly.
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

    const s = io(SOCKET_URL, {
      // Pass JWT in the query string — the WS handshake cannot carry custom headers.
      query: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    s.on('connect', () => console.log('[WS] Connected, id:', s.id))
    s.on('connect_error', (err) => console.warn('[WS] Connection error:', err.message))
    s.on('disconnect', (reason) => console.log('[WS] Disconnected:', reason))

    socketRef.current = s
    setSocket(s)

    return () => {
      s.disconnect()
      socketRef.current = null
    }
  }, []) // Only runs once — token is read once at mount

  return socket
}
