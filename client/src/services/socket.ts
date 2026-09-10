import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    const socketUrl = (import.meta as any).env?.VITE_SOCKET_URL || 
      (typeof window !== 'undefined' && window.location.port === '3000' 
        ? 'http://localhost:4000' 
        : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000'));

    socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('✅ WebSocket serveriga ulandi:', socketInstance?.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ WebSocket serveridan uzildi');
    });
  }

  return socketInstance;
}
