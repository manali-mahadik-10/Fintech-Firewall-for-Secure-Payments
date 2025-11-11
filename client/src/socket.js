// client/src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
});

socket.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('✅ Socket connected', socket.id);
});

socket.on('connect_error', (err) => {
  // eslint-disable-next-line no-console
  console.warn('Socket connect_error', err.message);
});

export default socket;
