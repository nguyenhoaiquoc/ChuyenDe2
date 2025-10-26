// src/libs/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(serverUrl: string, token?: string) {
  if (socket) return socket;
  socket = io(serverUrl, {
    auth: {
      token: token ?? null, // server đọc từ client.handshake.auth.token
    },
    transports: ['websocket'],
  });
  return socket;
}

export function getSocket() {
  return socket;
}
