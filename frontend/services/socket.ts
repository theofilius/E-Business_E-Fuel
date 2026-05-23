import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

/**
 * Singleton Socket.IO client. Connects to the backend on port 5001.
 * Same connection is reused across screens.
 */
const getSocketUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:5001';
  return 'http://localhost:5001';
};

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getSocketUrl(), {
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
