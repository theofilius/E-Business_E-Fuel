import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

/**
 * Singleton Socket.IO client. Connects to the backend on port 5001.
 * Same connection is reused across screens.
 */
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
